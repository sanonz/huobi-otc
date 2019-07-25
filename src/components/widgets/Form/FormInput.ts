import styles from './formInput.less';
import UIElement from '../../elements/UIElement';


class FormInput extends UIElement {

  public element: HTMLInputElement;

  constructor(name?: string) {
    super();

    styles.use();
    this.element = document.createElement('input');
    this.classList.add(styles.locals.input);

    if (name) {
      this.element.name = name;
    }
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default FormInput;
