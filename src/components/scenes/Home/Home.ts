import styles from './home.less';
import UIDiv from '../../elements/UIDiv';
import UIElement from '../../elements/UIElement';
import Trader from '../../widgets/Trader';
import Order from '../../widgets/Order';
import Setting from '../../widgets/Setting';
import Background from 'src/providers/Background';


class Home extends UIDiv {

  public bg: Background;
  public scene: Nullable<UIElement>;

  constructor() {
    super();

    this._handleSetting = this._handleSetting.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleStop = this._handleStop.bind(this);
    this._handleReset = this._handleReset.bind(this);
    this._handleBack = this._handleBack.bind(this);

    styles.use();
    this.classList.add(styles.locals.home);
    this.bg = this.getBackground();

    if (this.bg.state.trading) {
      this._createOrder();
    } else {
      this._createTrade();
    }
  }

  getBackground() {
    const page = chrome.extension.getBackgroundPage();
    const bg: Background = (page as any).bg;

    return bg;
  }

  _clearSence() {
    if(this.scene) {
      this.scene.destroy();
      this.scene = null;
    }
  }

  _createTrade() {
    this._clearSence();
    const trader = new Trader();
    this.scene = trader;
    trader.on('buy', this._handleSubmit);
    trader.on('sell', this._handleSubmit);
    trader.on('setting', this._handleSetting);
    this.append(trader);
  }

  _createOrder() {
    this._clearSence();
    const order = new Order();
    this.scene = order;
    order.on('stop', this._handleStop);
    order.on('reset', this._handleReset);
    this.append(order);
  }

  _createSetting() {
    this._clearSence();
    const setting = new Setting();
    this.scene = setting;
    setting.on('back', this._handleBack);
    this.append(setting);
  }

  _handleSetting() {
    this._createSetting();
  }

  _handleSubmit(data: any) {
    this._createOrder();
    this.bg.start(data);
  }

  _handleStop(status: boolean) {
    this.bg[status ? 'continue' : 'stop']();
  }

  _handleReset() {
    this.bg.end();
    this._createTrade();
  }

  _handleBack() {
    this._createTrade();
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Home;
