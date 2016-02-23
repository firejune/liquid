import ComponentWithChildren from './ComponentWithChildren';
import ListItem from './ListItem';

class List extends ComponentWithChildren {
  constructor() {
    super();

    this.element = $('<ul>');
    this.defineProperties([{
      id: 'style',
      label: 'Style',
      type: 'select',
      value: 'ul',
      options: List.possibleStyles
    }, {
      id: 'type',
      label: 'Numbering Type',
      type: 'select',
      value: '',
      options: List.possibleTypes,
      visible: () => this.properties.style === 'ol'
    }, {
      id: 'start',
      label: 'Start',
      type: 'textbox',
      value: '',
      visible: () => this.properties.style === 'ol'
    }, {
      id: 'reversed',
      label: 'Reversed',
      type: 'checkbox',
      value: false,
      visible: () => this.properties.style === 'ol'
    }]);
  }

  initialize() {
    let l = new ListItem;
    l.initialize('Item 1');
    this.insertLast(l);
    l = new ListItem;
    l.initialize('Item 2');
    this.insertLast(l);
    l = new ListItem;
    l.initialize('Item 3');
    this.insertLast(l);
    l = new ListItem;
    l.initialize('Item 4');
    this.insertLast(l);
  }

  canTakeChild(child) {
    return super.canTakeChild(child) && child instanceof ListItem;
  }

  update() {
    this.cssClasses.system = '';
    delete this.attributes.type;
    delete this.attributes.start;
    delete this.attributes.reversed;

    let tmp;
    if (this.properties.style === 'ol') {
      tmp = $('<ol>');
      if (this.properties.type) {
        this.attributes.type = this.properties.type;
      }
      if (this.properties.reversed) {
        this.attributes.reversed = this.properties.reversed;
      }
      if (this.properties.start) {
        this.attributes.start = this.properties.start;
      }
    } else {
      tmp = $('<ul>');
    }

    if (this.properties.style === 'unstyled') {
      this.cssClasses.system = 'list-unstyled';
    }
    if (this.properties.style === 'inline') {
      this.cssClasses.system = 'list-inline';
    }
    this.element.replaceWith(tmp);
    this.element = tmp;

    return super.update();
  }
}

List.possibleStyles = [
  { label: 'Unordered (UL)', value: 'ul' },
  { label: 'Ordered (OL)', value: 'ol' },
  { label: 'Unstyled (UL)', value: 'unstyled' },
  { label: 'Inline (UL)', value: 'inline' }
];

List.possibleTypes = [
  { label: 'Numbers (1,2,3..)', value: '' },
  { label: 'Letters (a,b,c..)', value: 'a' },
  { label: 'Letters (A,B,C..)', value: 'A' },
  { label: 'Roman (i,ii,iii..)', value: 'i' },
  { label: 'Roman (I,II,III..)', value: 'I' }
];

List.suggestedComponents = ['ListItem'];

export default List;
