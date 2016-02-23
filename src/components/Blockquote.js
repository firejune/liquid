import ComponentWithChildren from './ComponentWithChildren';
import BlockquoteFooter from './BlockquoteFooter';
import Paragraph from './Paragraph';

class Blockquote extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<blockquote>');
    this.defineProperties([{
      id: 'type',
      label: 'Type',
      type: 'select',
      value: '',
      options: Blockquote.possibleTypes
    }]);
  }

  initialize() {
    const p = new Paragraph;
    p.initialize(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.'
    );
    p.fixate();

    this.insertFirst(p);
    this.properties.showFooter = true;
    this.insertLast(this.createOrSelectInstance(BlockquoteFooter));
  }

  canTakeChild() {
    return false;
  }

  focus() {
    super.focus();

    const bqOptions = this.getMainOptionsGroup();
    bqOptions.add(this.createCheckBoxForSubComponent('showFooter', 'Footer', BlockquoteFooter,
      (parent, child) => {
        parent.insertLast(child);
      }
    ));
  }

  update() {
    this.cssClasses.system = this.properties.type;

    return super.update();
  }
}

Blockquote.possibleTypes = [
  { label: 'Regular', value: '' },
  { label: 'Reverse', value: 'blockquote-reverse' }
];

export default Blockquote;
