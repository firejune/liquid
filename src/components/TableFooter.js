import ComponentWithChildren from './ComponentWithChildren';
import TableRow from './TableRow';
import TableCell from './TableCell';

class TableFooter extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<tfoot>');
    this.fixate();
  }

  initialize() {
    const row = new TableRow;
    row.initialize();
    row.fixate();
    this.insertLast(row);

    let cell = new TableCell;
    cell.initialize('Summary 1');
    row.insertLast(cell);

    cell = new TableCell;
    cell.initialize('Summary 2');
    row.insertLast(cell);
  }

  canTakeChild() {
    return false;
  }
}

TableFooter.prettyName = 'Table Footer';

export default TableFooter;
