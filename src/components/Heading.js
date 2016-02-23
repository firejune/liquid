import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import textOptions from '../helpers/textOptions';

class Heading extends ComponentWithInlineEditing {
  constructor() {
    super();

    this.defineProperties({
      id: 'type',
      label: 'Type',
      type: 'select',
      value: 'h1',
      options: Heading.possibleTypes
    });
    this.element = $('<h1>');

    textOptions.construct(this);
  }

  initialize(str = 'Heading') {
    super.initialize(str);
  }

  update() {
    const tmp = $(`<${this.properties.type}>`);

    this.element.replaceWith(tmp);
    this.element = tmp;
    this.cssClasses.system = {};

    textOptions.update(this);

    return super.update();
  }
}

Heading.possibleTypes = [
  { label: 'H1', value: 'h1' },
  { label: 'H2', value: 'h2' },
  { label: 'H3', value: 'h3' },
  { label: 'H4', value: 'h4' },
  { label: 'H5', value: 'h5' },
  { label: 'H6', value: 'h6' }
];

export default Heading;
