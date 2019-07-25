import styles from './order.less';
import UIDiv from '../../elements/UIDiv';
import UIText from '../../elements/UIText';
import Button from '../Button';
import Background from '../../../providers/Background';
import coins from '../../../config/coins.json';


class Order extends UIDiv {

  protected _status: boolean = false;

  public elementBuyPrice: UIDiv;
  public elementSellPrice: UIDiv;
  public elementStatusText: UIText;
  public elementGainText: UIText;
  public elementPriceText: UIText;
  public elementAmountText: UIText;
  public elementAmountUnitText: UIText;
  public elementBuyPriceText: UIText;
  public elementSellPriceText: UIText;
  public elementRecentPriceText: UIText;
  public elementCountText: UIText;
  public elementStopBtn: Button;

  public bg: Background;

  constructor() {
    super();

    this._handleStop = this._handleStop.bind(this);
    this._handleReset = this._handleReset.bind(this);

    styles.use();
    this.classList.add(styles.locals.order);
    this.bg = this.getBackground();
    const state = this.bg.state;
    const total = state.amount / state[state.tradeType === 'buy' ? 'buyPrice' : 'sellPrice'];

    // 当前状态
    const status = new UIDiv();
    status.classList.add(styles.locals.orderItem);
    this.append(status);

    const statusLabel = new UIText('当前状态：');
    status.append(statusLabel);
  
    const statusText = new UIText();
    this.elementStatusText = statusText;
    status.append(statusText);

    // 刷新次数
    const count = new UIDiv();
    count.classList.add(styles.locals.orderItem);
    this.append(count);

    const countLabel = new UIText('刷新次数：');
    count.append(countLabel);

    const countText = new UIText(state.count.toString());
    this.elementCountText = countText;
    count.append(countText);

    // 买入单价
    const buyPrice = new UIDiv();
    this.elementBuyPrice = buyPrice;
    buyPrice.classList.add(styles.locals.orderItem);
    this.append(buyPrice);

    const buyPriceLabel = new UIText('买入单价：');
    buyPrice.append(buyPriceLabel);

    const buyPriceText = new UIText('￥' + state.buyPrice.toFixed(2));
    this.elementBuyPriceText = buyPriceText;
    buyPriceText.classList.add(styles.locals.success);
    buyPrice.append(buyPriceText);

    // 最新价格
    const recentPrice = new UIDiv();
    recentPrice.classList.add(styles.locals.orderItem);
    this.append(recentPrice);

    const recentPriceLabel = new UIText('最新价格：');
    recentPrice.append(recentPriceLabel);

    const recentPriceText = new UIText('￥' + state.recentPrice.toFixed(2));
    this.elementRecentPriceText = recentPriceText;
    recentPrice.append(recentPriceText);

    // 卖出单价
    const sellPrice = new UIDiv();
    this.elementSellPrice = sellPrice;
    sellPrice.classList.add(styles.locals.orderItem);
    this.append(sellPrice);

    const sellPriceLabel = new UIText('卖出单价：');
    sellPrice.append(sellPriceLabel);

    const sellPriceText = new UIText('￥' + state.sellPrice.toFixed(2));
    this.elementSellPriceText = sellPriceText;
    sellPriceText.classList.add(styles.locals.danger);
    sellPrice.append(sellPriceText);

    // 预计盈利
    const gain = new UIDiv();
    gain.classList.add(styles.locals.orderItem);
    this.append(gain);
    
    const gainLabel = new UIText('预计盈利：');
    gain.append(gainLabel);

    const gainText = new UIText('￥' + (total * (state.sellPrice - state.buyPrice)).toFixed(2));
    this.elementGainText = gainText;
    gain.append(gainText);

    // 交易总价
    const price = new UIDiv();
    price.classList.add(styles.locals.orderItem);
    this.append(price);
    
    const priceLabel = new UIText('交易总价：');
    price.append(priceLabel);

    const priceText = new UIText('￥' + state.amount.toFixed(2));
    this.elementPriceText = priceText;
    price.append(priceText);

    // 交易总量
    const amount = new UIDiv();
    amount.classList.add(styles.locals.orderItem);
    this.append(amount);

    const amountLabel = new UIText('交易总量：');
    amount.append(amountLabel);

    const amountText = new UIText(total.toFixed(8));
    this.elementAmountText = amountText;
    amount.append(amountText);
    const unit = new UIText();
    this.elementAmountUnitText = unit;
    unit.classList.add(styles.locals.unit);
    this.setAmountUnit(state.coinId);
    amount.append(unit);

    // 按钮
    const btnGroup = new UIDiv();
    btnGroup.classList.add(styles.locals.btnGroup);
    this.append(btnGroup);
    const stopBtn = new Button();
    stopBtn.danger = true;
    this.elementStopBtn = stopBtn;
    stopBtn.on('native.click', this._handleStop);
    btnGroup.append(stopBtn);
    const resetBtn = new Button('重置');
    resetBtn.on('native.click', this._handleReset);
    btnGroup.append(resetBtn);

    this.status = state.running;
  }

  get status() {
    return this._status;
  }

  set status(status) {
    const element = this.elementStatusText;
    element.text = status ? '进行中' : '未开始';
    element.classList[status ? 'add' : 'remove'](styles.locals.success);
    element.classList[status ? 'remove' : 'add'](styles.locals.muted);
    this.elementStopBtn.element.textContent = status ? '暂停' : '开始';
    this._status = status;
  }

  setAmountUnit(coinId: number) {
    if (!coinId) {
      return;
    }

    const coin = coins.find(v => v.coinId === coinId);
    if (coin) {
      this.elementAmountUnitText.text = coin.coinName;
    }
  }

  toggleTradeType(isBuy: boolean) {
    this.elementBuyPrice.classList[isBuy ? 'add' : 'remove'](styles.locals.active);
    this.elementSellPrice.classList[isBuy ? 'remove' : 'add'](styles.locals.active);
  }

  getBackground() {
    const page = chrome.extension.getBackgroundPage();
    const bg: Background = (page as any).bg;

    return bg;
  }

  _handleStop(evt: MouseEvent) {
    this.status = !this.status;

    this.emit('stop', this.status);
  }

  _handleReset(evt: MouseEvent) {
    this.emit('reset');
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Order;
