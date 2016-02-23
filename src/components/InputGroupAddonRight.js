import InputGroupAddon from './InputGroupAddon';
import Button from './Button';

class InputGroupAddonRight extends InputGroupAddon {
  constructor() {
    super();
  }

  initialize() {
    const button = new Button;
    button.initialize('Go!');
    this.insertFirst(button);
  }
}

InputGroupAddonRight.prettyName = 'Input Group Right Addon';

export default InputGroupAddonRight;
