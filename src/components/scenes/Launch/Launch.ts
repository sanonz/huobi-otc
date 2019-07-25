import styles from './launch.less';
import UIDiv from '../../elements/UIDiv';


class Launch extends UIDiv {

  public elementLogo: HTMLImageElement;

  constructor() {
    super();

    styles.use();
    this.classList.add(styles.locals.launch);

    const logo = document.createElement('img');
    logo.classList.add(styles.locals.logo);
    logo.src = 'assets/images/logo128.png';
    this.append(logo);
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Launch;
