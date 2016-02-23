import Component from './Component';
import linkOptions from '../helpers/linkOptions';
// import Pagination from './Pagination';

class PaginationItem extends Component {
  constructor() {
    super();
    this.element = $('<li><a href="#"></a></li>');

    this.defineProperties([{
      id: 'type',
      label: 'Type',
      type: 'select',
      value: 'default',
      options: PaginationItem.possibleTypes
    }, {
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    }, {
      id: 'active',
      label: 'Active',
      type: 'checkbox',
      value: false
    }, {
      id: 'value',
      label: 'Value',
      type: 'textbox',
      value: '',
      visible: () => this.properties.type === 'default'
    }]);
    linkOptions.construct(this);
  }

  canBeDroppedIn(component) {
    const Pagination = require('./Pagination').default;
    return component instanceof Pagination;
  }

  update() {
    const link = this.element.find('a');
    link.removeAttr('aria-label');
    link.empty();

    if (this.properties.type === 'previous') {
      link.attr('aria-label', 'Previous');
      link.html('<span aria-hidden="true">&laquo;</span>');
    } else if (this.properties.type === 'next') {
      link.attr('aria-label', 'Next');
      link.html('<span aria-hidden="true">&raquo;</span>');
    } else {
      link.text(this.properties.value);
    }

    this.cssClasses.system = '';
    if (this.properties.disabled) {
      this.cssClasses.system += ' disabled';
    }

    if (this.properties.active) {
      this.cssClasses.system += ' active';
      link.add('<span class="sr-only">(current)</span>');
    }

    linkOptions.updateDOMNode(this, link[0]);
    return super.update();
  }
}

PaginationItem.possibleTypes = [
  { label: 'Default', value: 'default' },
  { label: 'Previous', value: 'previous' },
  { label: 'Next', value: 'next' }
];

PaginationItem.prettyName = 'Pagination Item';

export default PaginationItem;
