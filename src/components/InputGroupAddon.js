import Div from './Div';
import Span from './Span';
import Paragraph from './Paragraph';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
import Dropdown from './Dropdown';
import InputRadioCheckBase from './InputRadioCheckBase';

class InputGroupAddon extends Div {
  constructor() {
    super();
    this.fixate();
  }

  canTakeChild(child) {
    if (!super.canTakeChild(child)) {
      return false;
    }

    if (this.children.length > 1) {
      return false;
    }

    return child instanceof Span
      || child instanceof Paragraph
      || child instanceof Button
      || child instanceof ButtonGroup
      || child instanceof Dropdown
      || child instanceof InputRadioCheckBase;
  }

  update() {
    this.cssClasses.system = 'input-group-addon';

    if (this.children[0] instanceof Button
      || this.children[0] instanceof ButtonGroup
      || this.children[0] instanceof Dropdown) {
      this.cssClasses.system = 'input-group-btn';
    }

    return super.update();
  }
}

InputGroupAddon.suggestedComponents = ['Span', 'Button', 'SplitButton', 'Dropdown'];

export default InputGroupAddon;
