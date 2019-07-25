import md5 from 'blueimp-md5';


export type TradeType = 'buy' | 'sell';

export interface State {
  trading: boolean;
  running: boolean;
  count: number;
  recentPrice: number;

  coinId: number;
  amount: number;
  buyPrice: number;
  sellPrice: number;
  password: string;
  tradeType: TradeType;
}

export interface NotifyOptions {
  message: string;
  body?: string;
  orderId?: number;
}

export interface StartOptions {
  coinId: number;
  amount: number;
  buyPrice: number;
  sellPrice: number;
  tradeType: TradeType;
}

export interface CheckoutData {
  tradeId: number;
  amount: number;
  ticket: string;
  password: string;
}

const api = 'https://otc-api.eiijo.cn/v1/';

class Background {

  public time: number = 0;
  public tabId: Nullable<number> = null;
  public orderId: Nullable<number> = null;
  
  public isDone: boolean = false;
  public isContinue: boolean = true;
  public isNotifyShown: boolean = false;

  public state: State = {
    // 内部数据
    trading: false,
    running: false,
    count: 0,
    recentPrice: 0,

    // 表单数据
    coinId: 0,
    amount: 0,
    buyPrice: 0,
    sellPrice: 0,
    tradeType: 'buy',
    password: '',
  };

  protected token: string = '';

  constructor() {
    this.checkMarket = this.checkMarket.bind(this);
    this._handleTabUpdate = this._handleTabUpdate.bind(this);

    chrome.tabs.onUpdated.addListener(this._handleTabUpdate);
  }

  setState<K extends keyof State>(key: K, value: State[K]) {
    this.state[key] = value;

    const scene = this.getHomeScene();
    if (!scene) {
      return;
    }

    switch (key) {
      case 'running':
        scene.status = value;
        break;

      case 'count':
        scene.elementCountText.text = value;
        break;

      case 'amount':
        scene.elementPriceText.text = '￥' + (value as number).toFixed(2);
        break;

      case 'buyPrice':
        scene.elementBuyPriceText.text = '￥' + (value as number).toFixed(2);
        break;

      case 'sellPrice':
        scene.elementSellPriceText.text = '￥' + (value as number).toFixed(2);
        break;

      case 'recentPrice':
        scene.elementRecentPriceText.text = '￥' + (value as number).toFixed(2);
        break;

      case 'coinId':
        scene.setAmountUnit(value);
        break;

      case 'tradeType':
        scene.toggleTradeType(value === 'buy');
        break;
    }
  }

  start(data: StartOptions) {
    this.isDone = false;
    this.isContinue = true;

    this.setState('trading', true);
    this.setState('coinId', data.coinId);
    this.setState('amount', data.amount);
    this.setState('buyPrice', data.buyPrice);
    this.setState('sellPrice', data.sellPrice);
    this.setState('tradeType', data.tradeType);
    this.continue();

    const scene = this.getHomeScene();
    if (!scene) {
      return;
    }

    const state = this.state;
    const amount = state.amount / state[state.tradeType === 'buy' ? 'buyPrice' : 'sellPrice'];
    scene.elementAmountText.text = amount.toFixed(8);
    scene.elementGainText.text = '￥' + (amount * (state.sellPrice - state.buyPrice)).toFixed(2);
  }

  setTabId(tabId: number) {
    this.tabId = tabId;
  }

  continue() {
    this.isContinue = true;
    this.setState('running', true);
    this.checkMarket();
  }

  stop() {
    this.isContinue = false;
    this.setState('running', false);
  }

  end() {
    this.stop();
    this.setState('count', 0);
    this.setState('trading', false);
  }

  send(otc: any) {
    return new Promise((resolve, reject) => {
      if (!this.tabId) {
        return reject('tabId is not defined');
      }

      chrome.tabs.sendMessage(this.tabId, JSON.stringify({otc}), resolve);
    });
  }

  triggerNotify(value: NotifyOptions) {
    this.send({action: 'notify', value}).then(this.dispatcher);
  }

  getScene() {
    const page: any = this.getPopup();
    if (page) {
      return page.popup.scene;
    }

    return null;
  }

  getHomeScene() {
    const scene = this.getScene();

    return scene ? scene.scene : null;
  }

  getPopup() {
    return chrome.extension.getViews({type: 'popup'})[0];
  }

  setToken(token: string) {
    this.token = token;
  }

  setIconAndPopup(tabId: number, disabled: boolean) {
    const str = disabled ? '.disabled' : '';
    chrome.browserAction.setIcon({
      tabId: tabId,
      path: {
        '16': `assets/images/logo16${str}.png`,
        '32': `assets/images/logo32${str}.png`,
        '48': `assets/images/logo48${str}.png`,
        '128': `assets/images/logo128${str}.png`,
      },
    });
    chrome.browserAction.setPopup({
      tabId: tabId,
      popup: (disabled ? 'disabled' : 'popup') + '.html',
    });
  }

  _handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    if (changeInfo.status === 'loading') {
      this.setIconAndPopup(tabId, !tab.url);
    }
  }

  fetchBalance() {
    return this.request('/capital/balance');
  }

  reverseTradeType() {
    return this.state.tradeType === 'buy' ? 'sell' : 'buy';
  }

  checkMarket() {
    if (!this.isContinue || this.isDone) {
      return;
    }

    this.time = Date.now();

    const params = {
      coinId: this.state.coinId,
      currency: 1,
      tradeType: this.state.tradeType,
      currPage: 1,
      payMethod: 0,
      country: 37,
      blockType: 'general',
      online: 1,
      range: 0,
      amount: this.state.amount,
    };
    let query = this.query({
      ...params,
      tradeType: this.reverseTradeType(), // 后端接口是站在商家角度写的，所以这里是反向的
    });
    this.isContinue = false;

    return this.request(api + 'data/trade-market?' + query)
      .then(res => res.json())
      .then(json => {
        let isContinue = true;
        for(let i = 0, len = json.data.length; i < len; i++) {
          const v = json.data[i];

          if (i === 0) {
            this.setState('recentPrice', v.price);
            this.setState('count', this.state.count + 1);
          }

          if (
            (params.tradeType === 'buy' ? this.state.buyPrice >= v.price : this.state.sellPrice <= v.price) &&
            params.amount >= v.minTradeLimit && params.amount <= v.maxTradeLimit
          ) {
            const data = {
              tradeId: v.id,
              amount: params.amount,
              ticket: '',
            };
            switch(params.tradeType) {
              case 'buy': // 购买
                this.checkout({...data, password: md5('otc, nono')});
                break;

              case 'sell': // 出售
                this.checkout({...data, password: md5(this.state.password)});
                break;
            }
            isContinue = false;
            break;
          }
        }

        this.isContinue = isContinue;

        if (isContinue) {
          const duration = this.time + 1000;
          const now = Date.now();
          if (now >= duration) {
            this.checkMarket();
          } else {
            setTimeout(this.checkMarket, duration - now);
          }
        }
      })
      .catch(() => {
        this.isDone = true;
      });
  }

  getTicket(tradeId: number) {
    return this.request(api + 'otc/order/ticket?' + this.query({tradeId}))
      .then(res => res.json())
      .then(json => json.data);
  }

  async checkout(data: CheckoutData) {
    const ticket = await this.getTicket(data.tradeId);
    data.ticket = ticket.ticket;
    const formData = new FormData();
    formData.append('tradeId', data.tradeId.toString());
    formData.append('amount', data.amount.toString());
    formData.append('ticket', data.ticket.toString());

    this.request(api + 'otc/order', {method: 'POST', body: formData})
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const orderId = json.data;
          const message =  ticket.tradeType === 1 ?
            `您在火币交易所购买的 ${ticket.coinName} 订单已生成，请马上去支付！`:
            `您在火币交易所出售的 ${ticket.coinName} 订单已生成，请马上去支付！`;
          const body = `费用：￥${data.amount}`;
          this.triggerNotify({message, body, orderId});
          this.sendToDingDing(`${message}\n\n> ${body}`);

          // 检测是否需要反向操作
          this.isContinue = true;
          switch(this.state.tradeType) {
            case 'buy': // 购买
              if (!!this.state.sellPrice) {
                this.orderId = orderId;
                this.setState('tradeType', this.reverseTradeType());
                this.checkOrder();
              }
              break;

            case 'sell': // 出售
              if (!!this.state.buyPrice) {
                this.orderId = orderId;
                this.setState('tradeType', this.reverseTradeType());
                this.checkOrder();
              }
              break;
          }
          this.isDone = true;
        } else {
          this.isDone = true;
          console.warn(json.message);
          this.triggerNotify(json.message);
        }
      })
      .catch(() => {
        this.isDone = true;
      });
  }

  checkOrder() {
    if (!this.isContinue || !this.orderId) {
      return;
    }

    // 当订单完成时才进行反向操作
    return this.request(api + 'otc/order/' + this.orderId)
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          // status = {
          //   0: '请付款',
          //   1: '等待卖家确认',
          //   2: '已取消',
          //   3: '已完成',
          //   4: '申诉中',
          //   5: '取消申诉',
          // };
          const status = json.data.order.status;
          if (status === 2) {  // 订单取消
            this.orderId = null;
            console.info('订单取消，请重新开始');
          } else if (status === 3) { // 订单者完成
            this.orderId = null;
            this.isDone = false;
            this.continue();
          } else {
            this.checkOrder();
          }
        } else {
          console.error(json.message);
        }
      })
      .catch(err => {
        console.error(err.message);
      });
  }

  dispatcher(json: any) {
    if (!json || !json.otc) {
      return;
    }

    const otc = json.otc;
    switch (otc.action) {
      case 'notify':
        // 
        break;

      default:
        break;
    }
  }

  query(params: Dictionary<string | number>) {
    const rs = [];
    for(let k in params) {
      rs.push(k + '=' + encodeURIComponent(params[k]));
    }

    return rs.join('&');
  }

  request(url: string, options: any = {}) {
    if (!options.headers) {
      options.headers = {};
    }
    if (!options.headers.fingerprint) {
      options.headers.fingerprint = 'e199c7e04bc998b7e3d7385c98b664e8';
    }
    if (!options.headers.token) {
      options.headers.token = this.token;
    }
    if (options.body) {
     if (options.body instanceof FormData) {
        //
      } else if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
    }

    return fetch(url, options);
  }

  sendToDingDing(message: string) {
    const api = localStorage['otc-ding-api'];
    if (!api) {
      return;
    }
    
    const data = {
      msgtype: 'markdown',
      markdown: {
        title: '火币 OTC 交易提醒',
        text: '',
      }
    };
    data.markdown.text += data.markdown.title;
    data.markdown.text += `\n> ${message}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    return fetch(api, {method: 'POST', headers, body: JSON.stringify(data)})
  }

  destroy() {
    chrome.tabs.onUpdated.removeListener(this._handleTabUpdate);
  }

}


export default Background;
