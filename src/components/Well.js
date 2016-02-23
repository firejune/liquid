import ComponentWithChildren from './ComponentWithChildren';
import Span from './Span';

class Well extends ComponentWithChildren {
  constructor() {
    super();

    this.defineProperties({
      id: 'size',
      label: 'Size',
      type: 'select',
      value: '',
      options: Well.possibleSizes
    });

    this.element = $('<div>');
  }

  initialize() {
    super.initialize();

    const s = new Span;
    s.initialize('Text of the well');
    this.insertLast(s);
  }

  update() {
    this.cssClasses.system = 'well';
    if (this.properties.size) {
      this.cssClasses.system += ` ${this.properties.size}`;
    }

    return super.update();
  }
}

Well.possibleSizes = [
  { label: 'Default', value: '' },
  { label: 'Small', value: 'well-sm' },
  { label: 'Large', value: 'well-lg' }
];

export default Well;
