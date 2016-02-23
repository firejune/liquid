import ComponentWithChildren from './ComponentWithChildren';
import TableCell from './TableCell';
// import TableBody from './TableBody';

class TableRow extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<tr>');
    this.defineProperties([{
      id: 'style',
      label: 'Style',
      type: 'select',
      value: '',
      options: TableCell.possibleStyles
    }]);
  }

  canBeDroppedIn(parent) {
    const TableBody = require('./TableBody').default;
    return super.canBeDroppedIn(parent) && parent instanceof TableBody;
  }

  canTakeChild(child) {
    return super.canTakeChild(child) && child instanceof TableCell;
  }

  update() {
    this.cssClasses.system = '';
    if (this.properties.style) {
      this.cssClasses.system = this.properties.style;
    }
    return super.update();
  }
}

TableRow.prettyName = 'Table Row';

export default TableRow;
