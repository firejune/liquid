import Div from './Div';
import TableBody from './TableBody';
import TableHeader from './TableHeader';
import TableFooter from './TableFooter';
import Caption from './Caption';

const props = ['striped', 'bordered', 'hover', 'condensed'];

class Table extends Div {
  constructor() {
    super();
    this.defineProperties([{
      id: 'responsive',
      label: 'Responsive',
      type: 'checkbox',
      value: true
    }, {
      id: 'striped',
      label: 'Striped',
      type: 'checkbox',
      value: false
    }, {
      id: 'bordered',
      label: 'Bordered',
      type: 'checkbox',
      value: false
    }, {
      id: 'hover',
      label: 'Hover',
      type: 'checkbox',
      value: false
    }, {
      id: 'condensed',
      label: 'Condensed',
      type: 'checkbox',
      value: false
    }]);
  }

  initialize() {
    const body = new TableBody;
    body.initialize();
    this.insertFirst(body);
    this.properties.showTableHeader = true;
    this.properties.showTableFooter = false;
    this.properties.showCaption = false;
    this.insertFirst(this.createOrSelectInstance(TableHeader));
  }

  canTakeChild() {
    return false;
  }

  focus() {
    super.focus();

    const tableOptions = this.getMainOptionsGroup();

    tableOptions.add(this.createCheckBoxForSubComponent('showTableHeader', 'Table Header',
      TableHeader, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertFirst(child);
      }
    ));

    tableOptions.add(this.createCheckBoxForSubComponent('showCaption', 'Caption',
      Caption, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertLast(child);
      }
    ));

    tableOptions.add(this.createCheckBoxForSubComponent('showTableFooter', 'Table Footer',
      TableFooter, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        index = 0;
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i] instanceof TableBody) {
            index = i + 1;
          }
        }
        parent.insertLast(child);
      }
    ));
  }

  update() {
    this.cssClasses.system = '';
    if (this.properties.responsive) {
      this.cssClasses.system = 'table-responsive';
    }

    super.startUpdate();

    const table = $('<table>');
    let css = 'table';

    for (let i = 0; i < props.length; i++) {
      if (this.properties[props[i]]) {
        css += ` table-${props[i]}`;
      }
    }

    table.attr('class', css);

    this.element.children().appendTo(table);
    this.element.append(table);

    return super.finishUpdate();
  }
}

export default Table;
