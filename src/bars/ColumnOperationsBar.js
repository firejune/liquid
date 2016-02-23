// import equal from 'deep-equal';
import Bar from './Bar';
import Column from '../components/Column';

export default class ColumnOperationsBar extends Bar {
  constructor(elem) {
    super();
    this.element = elem;
    elem.on('click', '.button', this.buttonClick.bind(this));
    app.on('component-focused component-blurred context-activated page-activated',
      this.showOrHide.bind(this));
  }

  /**
   * @param component
   */
  showOrHide() {
    if (app.context.page.focusedComponent instanceof Column) {
      this.show();
    } else {
      this.hide();
    }
  }

  buttonClick(e) {
    const component = app.context.page.focusedComponent;
    if (!(component instanceof Column)) {
      return false;
    }

    switch (e.currentTarget.dataset.id) {
      case 'left':
        component.moveLeftAction();
        break;
      case 'right':
        component.moveRightAction();
        break;
      case 'narrow':
        component.narrowAction();
        break;
      case 'widen':
        component.widenAction();
        break;
    }
  }

  update() {}
}
