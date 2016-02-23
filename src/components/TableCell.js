import ComponentWithInlineEditing from './ComponentWithInlineEditing';
// import TableRow from './TableRow';

class TableCell extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.element = $('<td>');
    this.defineProperties([{
      id: 'style',
      label: 'Style',
      type: 'select',
      value: '',
      options: TableCell.possibleStyles
    }, {
      id: 'rowspan',
      label: 'Rowspan',
      type: 'textbox',
      value: ''
    }, {
      id: 'colspan',
      label: 'Colspan',
      type: 'textbox',
      value: ''
    }]);
  }

  canBeDroppedIn(parent) {
    const TableRow = require('./TableRow').default;
    return super.canBeDroppedIn(parent) && parent instanceof TableRow;
  }

  update() {
    const TableHeader = require('./TableHeader').default;
    let tmp;
    if (this.hasParent(TableHeader)) {
      tmp = $('<th>');
    } else {
      tmp = $('<td>');
    }
    this.element.replaceWith(tmp);
    this.element = tmp;
    delete this.attributes.rowspan;
    delete this.attributes.colspan;
    if (this.properties.rowspan) {
      this.attributes.rowspan = this.properties.rowspan;
    }
    if (this.properties.colspan) {
      this.attributes.colspan = this.properties.colspan;
    }
    this.cssClasses.system = '';
    if (this.properties.style) {
      this.cssClasses.system = this.properties.style;
    }
    return super.update();
  }
}

TableCell.possibleStyles = [
  { label: 'Default', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Danger', value: 'danger' }
];

TableCell.prettyName = 'Table Cell';

export default TableCell;
