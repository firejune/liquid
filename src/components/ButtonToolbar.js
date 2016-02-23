import Div from './Div';
import ButtonGroup from './ButtonGroup';

class ButtonToolbar extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'btn-toolbar';
  }

  initialize() {
    let b = new ButtonGroup;
    b.initialize();
    this.insertLast(b);

    b = new ButtonGroup;
    b.initialize();
    this.insertLast(b);
  }

  canTakeChild(component) {
    return component instanceof ButtonGroup;
  }
}

ButtonToolbar.prettyName = 'Button Toolbar';
ButtonToolbar.suggestedComponents = ['Button', 'ButtonGroup'];

export default ButtonToolbar;
