import Button from './Button';
import Caret from './Caret';
import Component from './Component';
import Dropdown from './Dropdown';
import DropdownMenuItem from './DropdownMenuItem';

class SplitButton extends Dropdown {
  constructor() {
    super();
    this.inline = true;
    this.dropdownItemsOffset = 2;
    this.element = $('<div><ul class="dropdown-menu" role="menu"></ul></div>');
  }

  initialize() {
    const button = new Button;
    button.initialize('Button ');
    button.fixate();
    this.insertLast(button);

    const button2 = new Button;
    button2.initialize('');
    button2.cssClasses.parent = 'dropdown-toggle';
    this.insertLast(button2);

    const caret = new Caret;
    caret.initialize();
    button2.insertLast(caret);

    let d = new DropdownMenuItem;
    d.initialize('First Item', '#');
    this.insertLast(d);

    d = new DropdownMenuItem;
    d.initialize('Second Item', '#');
    this.insertLast(d);

    d = new DropdownMenuItem;
    d.initialize('Third Item', '#');
    this.insertLast(d);
  }

  update() {
    this.cssClasses.system = `${this.properties.type} btn-group`;
    if (this.properties.expanded) {
      this.cssClasses.system += ' open';
    }

    Component.prototype.startUpdate.call(this);
    this.children[1].attributes['data-toggle'] = 'dropdown';
    this.children[1].attributes['aria-expanded'] = 'false';
    if (this.properties.expanded) {
      this.children[1].attributes['aria-expanded'] = 'true';
    }
    this.element.prepend(this.children[1].update());
    this.element.prepend(this.children[0].update());
    this.updateMenu();

    return Component.prototype.finishUpdate.call(this);
  }
}

SplitButton.prettyName = 'Split Button';

export default SplitButton;
