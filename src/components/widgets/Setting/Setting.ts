import styles from './setting.less';
import UIDiv from '../../elements/UIDiv';
import Button from '../Button';
import { Form, FormItem, FormLabel, FormContent, FormInput } from '../Form';


class Setting extends Form {

  public elementInput: FormInput;

  constructor() {
    super();

    this._handleSave = this._handleSave.bind(this);
    this._handleBack = this._handleBack.bind(this);

    styles.use();
    this.classList.add(styles.locals.setting);

    const api = localStorage['otc-ding-api'];

    // 钉钉推送
    let item = new FormItem();
    let label = new FormLabel('钉钉推送');
    label.classList.add(styles.locals.formLabel);
    item.append(label);
    let content = new FormContent();
    content.classList.add(styles.locals.formContent);
    let input = new FormInput('api');
    this.elementInput = input;
    if (!!api) input.element.value = api;
    content.append(input);
    item.append(content);
    this.append(item);

    const tip = new UIDiv();
    tip.classList.add(styles.locals.tip);
    tip.element.innerHTML = '群机器人 <a href="https://open-doc.dingtalk.com/microapp/serverapi2/qf2nxq" target="_blank">webhook</a> 地址';
    content.append(tip);

    // 按钮
    item = new FormItem();
    content = new FormContent();
    content.classList.add(styles.locals.formContent);
    let buyBtn = new Button('保存');
    buyBtn.success = true;
    buyBtn.element.type = 'button';
    buyBtn.on('native.click', this._handleSave);
    content.append(buyBtn);
    let sellBtn = new Button('返回');
    sellBtn.element.type = 'botton';
    sellBtn.on('native.click', this._handleBack);
    content.append(sellBtn);
    item.append(content);
    this.append(item);
  }

  _handleSave(evt: MouseEvent) {
    evt.stopPropagation();
    localStorage['otc-ding-api'] = this.elementInput.element.value;
  }

  _handleBack(evt: MouseEvent) {
    evt.stopPropagation();
    this.emit('back');
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Setting;
