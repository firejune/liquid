import ComponentWithChildren from './ComponentWithChildren';
import TableRow from './TableRow';
import TableCell from './TableCell';

class TableHeader extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<thead>');
    this.fixate();
  }

  initialize() {
    const row = new TableRow;
    row.initialize();
    row.fixate();
    this.insertLast(row);

    let cell = new TableCell;
    cell.initialize('Column 1');
    row.insertLast(cell);

    cell = new TableCell;
    cell.initialize('Column 2');
    row.insertLast(cell);
  }

  canTakeChild() {
    return false;
  }
}

TableHeader.prettyName = 'Table Header';

export default TableHeader;
