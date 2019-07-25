import styles from './greeting.less';
import UIDiv from '../../elements/UIDiv';
import UIText from '../../elements/UIText';


class Greeting extends UIDiv {

  public elementLogo: HTMLImageElement;

  constructor() {
    super();

    styles.use();
    this.classList.add(styles.locals.greeting);

    const text = new UIText();
    text.classList.add(styles.locals.text);
    text.text = '登录火币 OTC 之后插件才有效果~';
    this.append(text);
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Greeting;
