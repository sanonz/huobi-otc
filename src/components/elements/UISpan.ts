import UIElement from './UIElement';


class UISpan extends UIElement {

  public element: HTMLSpanElement;

  constructor() {
    super();

    this.element = document.createElement('span');
  }

}


export default UISpan;
