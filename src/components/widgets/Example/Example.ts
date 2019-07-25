import styles from './example.less';
import UIDiv from '../../../components/elements/UIDiv';


class Example extends UIDiv {

  constructor() {
    super();

    styles.use();
    this.classList.add(styles.locals.example);
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default Example;
