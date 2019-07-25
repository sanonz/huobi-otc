import styles from './form.less';
import UIElement from '../../elements/UIElement';


class Form extends UIElement {

  public element: HTMLFormElement;

  constructor() {
    super();

    styles.use();
    this.element = document.createElement('form');
    this.classList.add(styles.locals.form);
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Form;
