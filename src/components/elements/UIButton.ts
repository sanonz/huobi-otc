import UIElement from './UIElement';


class UIButton extends UIElement {

  public element: HTMLButtonElement;

  constructor() {
    super();

    this.element = document.createElement('button');
    this.element.type = 'button';
  }

  get text() {
    return this.element.textContent;
  }

  set text(text) {
    this.element.textContent = text;
  }

}


export default UIButton;
