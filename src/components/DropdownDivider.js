import Component from './Component';

class DropdownDivider extends Component {
  constructor() {
    super();
    this.cssClasses.system = 'divider';
    this.element = $('<li role="presentation"></li>');
    this.flags.canBeMoved = false;
  }
}

DropdownDivider.prettyName = 'Dropdown Divider';

export default DropdownDivider;
