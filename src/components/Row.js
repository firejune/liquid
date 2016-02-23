import ComponentWithChildren from './ComponentWithChildren';
import Column from './Column';
import Clearfix from './Clearfix';
import wrapInAutomaticElement from '../helpers/wrapInAutomaticElement';

class Row extends ComponentWithChildren {
  constructor() {
    super();
    this.cssClasses.system = 'row';
    this.element = $('<div>');
  }

  canTakeChild(child) {
    return !(child instanceof Row);
  }

  beforeDrop() {
    if (app.draggedComponent instanceof Column || app.draggedComponent instanceof Clearfix) {
      return;
    }
    const col = new Column;
    col.initialize();
    wrapInAutomaticElement(col);
  }
}

Row.suggestedComponents = ['Column', 'Clearfix'];

export default Row;
