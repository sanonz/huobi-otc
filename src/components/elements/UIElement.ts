import { EventEmitter } from 'events';
import appStyles from '../../app.less';


export interface Handles<T> {
  [key: string]: T
}

export type Listener = (...args: any[]) => void;

export type StackElement = Element | UIElement;

class UIElement extends EventEmitter {

  protected _element: Element;
  protected _parent: Nullable<UIElement> = null;
  protected _nativeEvents: Handles<Listener> = {};
  protected _children: StackElement[] = [];
  protected _visible: boolean = true;

  constructor() {
    super();

    this._handleNewListener    = this._handleNewListener   .bind(this);
    this._handleRemoveListener = this._handleRemoveListener.bind(this);

    this.on('newListener',    this._handleNewListener);
    this.on('removeListener', this._handleRemoveListener);
  }

  get element() {
    return this._element;
  }

  set element(element) {
    this._element = element;
  }

  get parent() {
    return this._parent;
  }

  set parent(parent: Nullable<UIElement>) {
    this._parent = parent;
  }

  get children() {
    return this._children;
  }

  get classList() {
    return this._element.classList;
  }

  get visible() {
    return this._visible;
  }

  set visible(visible: boolean) {
    this.classList[visible ? 'remove' : 'add'](appStyles.locals.hidden);
    this._visible = visible;
  }

  append(...elements: StackElement[]) {
    for(let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      if(element instanceof UIElement)  {
        if(element.parent) {
          element.parent.remove(element);
        }

        this._element.appendChild(element.element);
        element.parent = this;
      } else {
        this._element.appendChild(element);
      }
      this._children.push(element);
      this.emit('append', element);
      this.emit('add', element);
    }

    return this;
  }

  prepend(...elements: StackElement[]) {
    let node: StackElement;
    let first: Nullable<ChildNode> = this._element.firstChild;
    for(let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      if(element instanceof UIElement) {
        if(element.parent) {
          element.parent.remove(element);
        }

        node = element.element;
        element.parent = this;
      } else {
        node = element;
      }
      if(first) {
        this._element.insertBefore(node, first);
        first = node;
      } else {
        this._element.appendChild(node);
      }
      this._children.push(element);
      this.emit('prepend', element);
      this.emit('add', element);
    }

    return this;
  }

  remove(...elements: StackElement[]) {
    for(let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      if(element instanceof UIElement) {
        this._element.removeChild(element.element);
        element.parent = null;
      } else {
        this._element.removeChild(element);
      }
      this._children.splice(this._children.indexOf(element), 1);
      this.emit('remove', element);
    }

    return this;
  }

  appendTo(root: Nullable<Element> | UIElement) {
    if(root) {
      if(root instanceof UIElement) {
        if(this.parent) {
          this.parent.remove(this);
        }

        root.append(this);
      } else {
        root.appendChild(this._element);
      }
    }

    return this;
  }

  _checkNativeEventName(eventName: string) {
    if(!String(eventName).startsWith('native.') || !this._element) {
      return false;
    }

    const name = eventName.split('.').pop();
    if(!name || !('on' + name in this._element)) {
      return false;
    }

    return name;
  }

  _handleNewListener(eventName: string) {
    const name = this._checkNativeEventName(eventName);
    if(!name) {
      return;
    }

    if(!this._nativeEvents[name]) {
      this._nativeEvents[name] = (evt: Event): any => this.emit(eventName, evt, this);
      this._element.addEventListener(name, this._nativeEvents[name]);
    }
  }

  _handleRemoveListener(eventName: string) {
    const name = this._checkNativeEventName(eventName);
    if(!name) {
      return;
    }

    if(this.listenerCount(eventName) === 0) {
      this._element.removeEventListener(name, this._nativeEvents[name]);
      delete this._nativeEvents[name];
    }
  }

  destroy() {
    this.emit('destory');

    if(this._parent) {
      this._parent.remove(this);
    }

    for(let eventName in this._nativeEvents) {
      this.removeAllListeners(eventName);
      this._element.removeEventListener(eventName, this._nativeEvents[eventName]);
      delete this._nativeEvents[eventName];
    }

    this.removeAllListeners();
  }

}


export default UIElement;
