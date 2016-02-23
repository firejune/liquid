import ComponentWithChildren from './ComponentWithChildren';
import ListGroupItem from './ListGroupItem';

const typeMap = {
  ul: 'ul',
  'div-with-links': 'div',
  'div-with-buttons': 'div'
};

class ListGroup extends ComponentWithChildren {
  constructor() {
    super();

    this.element = $('<ul>');

    this.defineProperties({
      id: 'type',
      label: 'Type',
      type: 'select',
      value: 'ul',
      options: ListGroup.possibleTypes
    });
  }

  initialize() {
    const lg1 = new ListGroupItem;
    lg1.initialize('List Group Item 1');
    this.insertLast(lg1);
    const lg2 = new ListGroupItem;
    lg2.initialize('List Group Item 2');
    this.insertLast(lg2);
    const lg3 = new ListGroupItem;
    lg3.initialize('List Group Item 3');
    this.insertLast(lg3);
  }

  canTakeChild(component) {
    return super.canTakeChild(component) && component instanceof ListGroupItem;
  }

  update() {
    const tmp = $(`<${typeMap[this.properties.type]}>`);
    this.element.replaceWith(tmp);
    this.element = tmp;
    this.cssClasses.system = 'list-group';
    return super.update();
  }
}

ListGroup.possibleTypes = [
  { label: 'Unordered List', value: 'ul' },
  { label: 'Div With Links', value: 'div-with-links' },
  { label: 'Div With Buttons', value: 'div-with-buttons' }
];

ListGroup.prettyName = 'List Group';
ListGroup.suggestedComponents = ['ListGroupItem'];

export default ListGroup;
