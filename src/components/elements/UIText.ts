import UISpan from './UISpan';


class UIText extends UISpan {

  protected _text: string;

  constructor(text?: string) {
    super();

    if(text) {
      this.text = text;
    }
  }

  get text() {
    return this._text;
  }

  set text(text: string) {
    this._element.textContent = this._text = text;
  }

}


export default UIText;
