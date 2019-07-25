import styles from '../app.less';
import UIDiv from '../components/elements/UIDiv';
import UIElement from '../components/elements/UIElement';
import Background from '../providers/background';
import Launch from '../components/scenes/Launch';
import Greeting from '../components/scenes/Greeting';
import Home from '../components/scenes/Home';


class Popup extends UIDiv {

  public bg: Background;
  public scene: Nullable<UIElement>;

  constructor() {
    super();

    this.dispatcher = this.dispatcher.bind(this);

    styles.use();
    this.classList.add(styles.locals.main);
    this.bg = this.getBackground();

    this.getTabId().then(tabId => {
      this.bg.setTabId(tabId);
      this.bg.send({action: 'init'}).then(this.dispatcher);
    });

    this.render(Launch);
  }

  render(Scene: any) {
    if(this.scene) {
      this.scene.destroy();
      this.scene = null;
    }

    const scene = new Scene();
    this.scene = scene;
    this.append(scene);
  }

  getTabId(): Promise<number> {
    return new Promise((resolve) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => resolve(tabs[0].id));
    });
  }

  getBackground() {
    const page = chrome.extension.getBackgroundPage();
    const bg: Background = (page as any).bg;

    return bg;
  }

  dispatcher(json: any) {
    if (!json || !json.otc) {
      return;
    }

    const otc = json.otc;
    switch (otc.action) {
      case 'init':
        if (!otc.token) {
          this.render(Greeting);
        } else {
          this.render(Home);
          this.bg.setToken(otc.token);
        }
        break;

      default:
        break;
    }
  }

  destroy() {
    super.destroy();

    styles.unuse();

    if(this.scene) {
      this.scene.destroy();
      this.scene = null;
    }
  }

}


export default Popup;
