import ComponentWithInlineEditing from './ComponentWithInlineEditing';

class DropdownHeader extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.cssClasses.system = 'dropdown-header';
    this.element = $('<li role="presentation"></li>');
    this.flags.canBeMoved = false;
  }

  initialize(text = 'Header') {
    super.initialize(text);
  }
}

DropdownHeader.prettyName = 'Dropdown Header';

export default DropdownHeader;
