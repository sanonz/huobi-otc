import UIElement from './UIElement';


class UIDiv extends UIElement {

  public element: HTMLDivElement;

  constructor() {
    super();

    this.element = document.createElement('div');
  }

}


export default UIDiv;
