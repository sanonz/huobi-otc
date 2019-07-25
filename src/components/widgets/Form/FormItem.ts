import styles from './formItem.less';
import appStyles from '../../../app.less';
import UIDiv from '../../elements/UIDiv';


class FormItem extends UIDiv {

  constructor() {
    super();

    styles.use();
    this.classList.add(styles.locals.item);
    this.classList.add(appStyles.locals.clearfix);
  }

  destroy() {
    super.destroy();

    styles.unuse();
  }

}


export default FormItem;
