import ComponentWithChildren from './ComponentWithChildren';
import Span from './Span';
import Paragraph from './Paragraph';
import Heading from './Heading';
import linkOptions from '../helpers/linkOptions';

class ListGroupItem extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<li>');
    this.defineProperties([{
      id: 'style',
      label: 'Style',
      type: 'select',
      value: '',
      options: ListGroupItem.possibleStyles
    }, {
      id: 'active',
      label: 'Active',
      type: 'checkbox',
      value: false
    }, {
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    }]);
    linkOptions.construct(this, '', this.isLink.bind(this));
  }

  initialize(text = 'List Group Item') {
    const span = new Span;
    span.initialize(text);
    this.insertFirst(span);
  }

  drop(component) {
    if (component instanceof Heading) {
      component.cssClasses.parent = 'list-group-item-heading';
    }
    if (component instanceof Paragraph) {
      component.cssClasses.parent = 'list-group-item-text';
    }
    return component;
  }

  canTakeChild(component) {
    return super.canTakeChild(component) && !(component instanceof ListGroupItem);
  }

  canBeDroppedIn(parent) {
    const ListGroup = require('./ListGroup').default;
    return super.canBeDroppedIn(parent) && parent instanceof ListGroup;
  }

  undrop(component) {
    component.cssClasses.parent = '';
    return component;
  }

  isLink() {
    return this.parent && this.parent.properties.type === 'div-with-links';
  }

  isButton() {
    return this.parent && this.parent.properties.type === 'div-with-buttons';
  }

  update() {
    let tmp;
    if (this.isLink()) {
      tmp = $('<a>');
    } else if (this.isButton()) {
      tmp = $('<button>');
    } else {
      tmp = $('<li>');
    }
    this.element.replaceWith(tmp);
    this.element = tmp;
    linkOptions.update(this);
    this.cssClasses.system = 'list-group-item';
    if (this.properties.style) {
      this.cssClasses.system += ` ${this.properties.style}`;
    }
    if (this.properties.active) {
      this.cssClasses.system += ' active';
    }
    if (this.properties.disabled) {
      this.cssClasses.system += ' disabled';
    }

    return super.update();
  }
}

ListGroupItem.possibleStyles = [
  { label: 'Default', value: '' },
  { label: 'Success', value: 'list-group-item-success' },
  { label: 'Info', value: 'list-group-item-info' },
  { label: 'Warning', value: 'list-group-item-warning' },
  { label: 'Danger', value: 'list-group-item-danger' }
];

ListGroupItem.prettyName = 'List Group Item';

export default ListGroupItem;
