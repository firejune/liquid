import ComponentWithChildren from './ComponentWithChildren';
import Anchor from './Anchor';

class DropdownMenuItem extends ComponentWithChildren {
  constructor() {
    super();

    this.element = $('<li role="presentation"></li>');
    this.flags.canBeMoved = false;

    this.defineProperties({
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    });
  }

  initialize(text = 'Dropdown Item', url = '#') {
    const link = new Anchor;
    link.initialize(text, url);
    link.fixate();
    this.insertFirst(link);
  }

  canTakeChild() {
    return false;
  }

  update() {
    this.cssClasses.system = '';
    if (this.properties.disabled) {
      this.cssClasses.system = 'disabled';
    }

    return super.update();
  }
}

DropdownMenuItem.prettyName = 'Dropdown Menu Item';

export default DropdownMenuItem;
