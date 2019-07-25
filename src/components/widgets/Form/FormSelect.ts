import styles from './formSelect.less';
import UIElement from '../../elements/UIElement';


class Option extends UIElement {

  public element: HTMLOptionElement;

  constructor() {
    super();

    this.element = document.createElement('option');
    this.classList.add(styles.locals.option);
  }

  destroy() {
    super.destroy();
  }

}

class FormSelect extends UIElement {

  static Option = Option;

  public element: HTMLSelectElement;

  constructor(name?: string) {
    super();

    styles.use();
    this.element = document.createElement('select');
    this.classList.add(styles.locals.select);

    if (name) {
      this.element.name = name;
    }
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default FormSelect;
