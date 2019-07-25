export type SendResponse = (response: any) => void;

class Content {

  public isNotifyclicked: boolean = false;

  constructor() {
    this._handleMessage = this._handleMessage.bind(this);

    chrome.runtime.onMessage.addListener(this._handleMessage);
  }

  triggerNotify(message: string, body?: string, orderId?: string) {
    const notification = this.notify(message, {
      body,
      icon: 'https://file.eiijo.cn/vue/static/favicon.ico',
    });

    return notification;
  }

  notify(message: string, options: NotificationOptions) {
    let notification = null;
    if (!('Notification' in window)) {
      alert(message);
    } else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      notification = new Notification(message, options);
    }  else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // 如果用户同意，就可以向他们发送通知
        if (permission === 'granted') {
          notification = new Notification(message, options);
        }
      });
    }

    return notification;
  }

  dispatchEvent(type: string, detail?: any) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(`otc.${type}`, false, false, detail);
    document.dispatchEvent(evt);
  }

  _handleMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: SendResponse) {
    if (sender.tab) {
      return /* from a content script */;
    }

    // from the extension
    try {
      const json = JSON.parse(request);
      if (!json || !json.otc) {
        return /* from other extension */;
      }

      const otc = json.otc;
      switch (otc.action) {
        case 'init':
          const token = localStorage['otc-token'];
          sendResponse({
            otc: {
              action: otc.action,
              token: !token ? null : token,
            },
          });
          break;

        case 'notify':
          const self = this;
          const orderId = otc.value.orderId;
          if (orderId) {
            const notify = () => {
              const notification = this.triggerNotify(otc.value.message, otc.value.body);
              if (notification) {
                self.isNotifyclicked = false;
                notification.addEventListener('close', function() {
                  if (!self.isNotifyclicked) {
                    setTimeout(notify, 1000);
                  }
                });
                notification.addEventListener('click', function(this: Notification) {
                  self.isNotifyclicked = true;
                  window.focus();
                  self.dispatchEvent('notify', orderId);
                  this.close();
                });
              }
            };
            notify();
          }
          break;

        default:
          break;
      }
    } catch(err) {
      console.error(err);
    }
  }

  destroy() {
    chrome.runtime.onMessage.removeListener(this._handleMessage);
  }

}


export default Content;
