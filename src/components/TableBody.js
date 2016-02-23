import ComponentWithChildren from './ComponentWithChildren';
import TableRow from './TableRow';
import TableCell from './TableCell';

class TableBody extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<tbody>');
    this.fixate();
  }

  initialize() {
    let row = new TableRow;
    row.initialize();
    this.insertLast(row);

    let cell = new TableCell;
    cell.initialize('Cell 1');
    row.insertLast(cell);

    cell = new TableCell;
    cell.initialize('Cell 2');
    row.insertLast(cell);

    row = new TableRow;
    row.initialize();
    this.insertLast(row);

    cell = new TableCell;
    cell.initialize('Cell 3');
    row.insertLast(cell);

    cell = new TableCell;
    cell.initialize('Cell 4');
    row.insertLast(cell);
  }

  canTakeChild(child) {
    return super.canTakeChild(child) && child instanceof TableRow;
  }
}

TableBody.prettyName = 'Table Body';

export default TableBody;
