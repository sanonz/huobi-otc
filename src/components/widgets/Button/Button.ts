import styles from './button.less';
import UIButton from '../../elements/UIButton';


class Button extends UIButton {

  protected _primary: boolean = false;
  protected _success: boolean = false;
  protected _danger: boolean = false;

  constructor(text?: string) {
    super();

    styles.use();
    this.classList.add(styles.locals.button);

    if(text) {
      this.text = text;
    }
  }

  get primary() {
    return this._primary;
  }

  set primary(primary) {
    this.classList[primary ? 'add' : 'remove'](styles.locals.primary);
    this._primary = primary;
  }

  get success() {
    return this._success;
  }

  set success(success) {
    this.classList[success ? 'add' : 'remove'](styles.locals.success);
    this._success = success;
  }

  get danger() {
    return this._danger;
  }

  set danger(danger) {
    this.classList[danger ? 'add' : 'remove'](styles.locals.danger);
    this._danger = danger;
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Button;
