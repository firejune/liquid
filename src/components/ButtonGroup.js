import ComponentWithChildren from './ComponentWithChildren';
import Button from './Button';

class ButtonGroup extends ComponentWithChildren {
  constructor() {
    super();
    this.inline = true;
    this.attributes.role = 'group';
    this.element = $('<div>');
    this.defineProperties([{
      id: 'justified',
      label: 'Justified',
      type: 'checkbox',
      value: false
    }, {
      id: 'type',
      label: 'Type',
      type: 'select',
      value: 'btn-group',
      options: ButtonGroup.possibleTypes
    }, {
      id: 'size',
      label: 'Size',
      type: 'select',
      value: '',
      options: ButtonGroup.possibleSizes
    }]);
  }

  initialize() {
    let b = new Button;
    b.initialize('Button 1');
    this.insertLast(b);

    b = new Button;
    b.initialize('Button 2');
    this.insertLast(b);
  }

  canTakeChild(component) {
    const Dropdown = require('./Dropdown').default;
    return component instanceof Button || component instanceof Dropdown;
  }

  update() {
    this.cssClasses.system = this.properties.type;

    if (this.properties.size) {
      this.cssClasses.system += ` ${this.properties.size}`;
    }

    if (this.properties.justified) {
      this.cssClasses.system += ' btn-group-justified';
    }

    return super.update();
  }
}

ButtonGroup.possibleTypes = [
  { label: 'Horizontal', value: 'btn-group' },
  { label: 'Vertical', value: 'btn-group-vertical' }
];

ButtonGroup.possibleSizes = [
  { label: 'Large', value: 'btn-group-lg' },
  { label: 'Default', value: '' },
  { label: 'Small', value: 'btn-group-sm' },
  { label: 'Extra Small', value: 'btn-group-xs' }
];

ButtonGroup.prettyName = 'Button Group';
ButtonGroup.suggestedComponents = ['Button'];

export default ButtonGroup;
