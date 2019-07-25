import styles from './form.less';
import UIDiv from '../../elements/UIDiv';


class FormContent extends UIDiv {

  constructor() {
    super();

    styles.use();
    this.classList.add(styles.locals.content);
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default FormContent;
