import styles from './formLabel.less';
import UIElement from '../../elements/UIElement';


class FormLabel extends UIElement {

  public element: HTMLLabelElement;

  constructor(text?: string) {
    super();

    styles.use();
    this.element = document.createElement('label');
    this.classList.add(styles.locals.label);

    if(text) {
      this.element.textContent = text;
    }
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default FormLabel;
