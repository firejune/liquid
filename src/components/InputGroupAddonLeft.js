import InputGroupAddon from './InputGroupAddon';
import Span from './Span';

class InputGroupAddonLeft extends InputGroupAddon {
  constructor() {
    super();
  }

  initialize() {
    const span = new Span;
    span.initialize('Addon');
    this.insertFirst(span);
  }
}

InputGroupAddonLeft.prettyName = 'Input Group Left Addon';

export default InputGroupAddonLeft;
