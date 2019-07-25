import styles from './trader.less';
import Button from '../../widgets/Button';
import { Form, FormItem, FormLabel, FormContent, FormInput, FormSelect } from '../../widgets/Form';
import coins from '../../../config/coins.json';


class Trader extends Form {

  constructor() {
    super();

    this._handleSetting = this._handleSetting.bind(this);
    this._handleBuy = this._handleBuy.bind(this);
    this._handleSell = this._handleSell.bind(this);

    styles.use();
    this.classList.add(styles.locals.trader);

    const data = localStorage['otc-form-data'] ? JSON.parse(localStorage['otc-form-data']) : null;

    // 交易币种
    let item = new FormItem();
    let label = new FormLabel('交易币种');
    label.classList.add(styles.locals.formLabel);
    item.append(label);
    let content = new FormContent();
    content.classList.add(styles.locals.formContent);
    const select = new FormSelect('coinId');
    select.element.setAttribute('data-format', 'number');
    const options = coins.map((c, i) => {
      const option = new FormSelect.Option();
      option.element.text = c.coinName;
      option.element.value = c.coinId.toString();

      if (data ? c.coinId === data.coinId : i === 0) {
        option.element.selected = true;
      }

      return option;
    });
    select.append(...options);
    content.append(select);
    item.append(content);
    this.append(item);

    // 买入价格
    item = new FormItem();
    label = new FormLabel('买入价格');
    label.classList.add(styles.locals.formLabel);
    item.append(label);
    content = new FormContent();
    content.classList.add(styles.locals.formContent);
    let input = new FormInput('buyPrice');
    input.element.required = true;
    input.element.setAttribute('data-format', 'number');
    if (data) input.element.value = data.buyPrice;
    content.append(input);
    item.append(content);
    this.append(item);

    // 卖出价格
    item = new FormItem();
    label = new FormLabel('卖出价格');
    label.classList.add(styles.locals.formLabel);
    item.append(label);
    content = new FormContent();
    content.classList.add(styles.locals.formContent);
    input = new FormInput('sellPrice');
    input.element.required = true;
    input.element.setAttribute('data-format', 'number');
    if (data) input.element.value = data.sellPrice;
    content.append(input);
    item.append(content);
    this.append(item);

    // 交易价格
    item = new FormItem();
    label = new FormLabel('交易价格');
    label.classList.add(styles.locals.formLabel);
    item.append(label);
    content = new FormContent();
    content.classList.add(styles.locals.formContent);
    input = new FormInput('amount');
    input.element.type = 'number';
    input.element.required = true;
    input.element.setAttribute('data-format', 'number');
    if (data) input.element.value = data.amount;
    content.append(input);
    item.append(content);
    this.append(item);

    // 按钮
    item = new FormItem();
    let setBtn = new Button('设置');
    setBtn.classList.add(styles.locals.formSetting);
    setBtn.element.type = 'button';
    setBtn.on('native.click', this._handleSetting);
    item.append(setBtn);
    content = new FormContent();
    content.classList.add(styles.locals.formContent);
    let buyBtn = new Button('买入');
    buyBtn.success = true;
    buyBtn.element.type = 'button';
    buyBtn.on('native.click', this._handleBuy);
    content.append(buyBtn);
    let sellBtn = new Button('卖出');
    sellBtn.danger = true;
    sellBtn.element.type = 'botton';
    sellBtn.on('native.click', this._handleSell);
    content.append(sellBtn);
    item.append(content);
    this.append(item);
  }

  _handleSetting(evt: MouseEvent) {
    evt.stopPropagation();
    this.emit('setting');
  }

  _handleBuy(evt: MouseEvent) {
    evt.stopPropagation();
    this.checkout('buy');
  }
  
  _handleSell(evt: MouseEvent) {
    evt.stopPropagation();
    this.checkout('sell');
  }

  checkout(type: 'buy' | 'sell') {
    if (this.element.reportValidity()) {
      const data: Dictionary<string> = {tradeType: type};
      for (let i = 0, len = this.element.length; i < len; i++) {
        const node: any = this.element[i];
        if (!node.disabled && node.name) {
          data[node.name] = node.getAttribute('data-format') === 'number' ? parseFloat(node.value) : node.value;
        }
      }

      localStorage['otc-form-data'] = JSON.stringify(data);

      this.emit(type, data);
    }
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Trader;
