import Div from './Div';
import InputGroupAddonLeft from './InputGroupAddonLeft';
import InputGroupAddonRight from './InputGroupAddonRight';
import InputText from './InputText';

class InputGroup extends Div {
  constructor() {
    super();
    this.defineProperties([{
      id: 'size',
      label: 'Size',
      type: 'select',
      value: '',
      options: InputGroup.possibleSizes
    }]);
  }

  initialize() {
    this.properties.showInputGroupAddonLeft = true;
    this.properties.showInputGroupAddonRight = true;
    this.insertFirst(this.createOrSelectInstance(InputGroupAddonLeft));
    const it = new InputText;
    it.initialize();
    this.insertLast(it);
    this.insertLast(this.createOrSelectInstance(InputGroupAddonRight));
  }

  canTakeChild(component) {
    return super.canTakeChild(component) && component instanceof InputText;
  }

  focus() {
    super.focus();

    const igOptions = this.getMainOptionsGroup();
    igOptions.add(this.createCheckBoxForSubComponent('showInputGroupAddonLeft', 'Left Addon',
      InputGroupAddonLeft, (parent, child, index) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertFirst(child);
      }
    ));

    igOptions.add(this.createCheckBoxForSubComponent('showInputGroupAddonRight', 'Right Addon',
      InputGroupAddonRight, (parent, child, index) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertLast(child);
      }
    ));
  }

  update() {
    this.cssClasses.system = 'input-group';
    if (this.properties.size) {
      this.cssClasses.system += ` ${this.properties.size}`;
    }
    return super.update();
  }
}

InputGroup.possibleSizes = [
  { label: 'Small', value: 'input-group-sm' },
  { label: 'Default', value: '' },
  { label: 'Large', value: 'input-group-lg' }
];

InputGroup.prettyName = 'Input Group';

export default InputGroup;
