import ComponentWithChildren from './ComponentWithChildren';
import NavItem from './NavItem';
import NavBar from './NavBar';

class Nav extends ComponentWithChildren {
  constructor() {
    super();

    this.element = $('<ul>');
    this.defineProperties([{
      id: 'type',
      label: 'Nav Type',
      type: 'select',
      value: 'nav-tabs',
      options: Nav.possibleTypes,
      visible: () => !this.isParentNavbar()
    }, {
      id: 'stacked',
      label: 'Stacked',
      type: 'checkbox',
      value: false,
      visible: () => this.properties.type === 'nav-pills'
    }, {
      id: 'justified',
      label: 'Justified',
      type: 'checkbox',
      value: false,
      visible: () => !this.isParentNavbar()
    }]);
  }

  initialize() {
    let n = new NavItem;
    n.initialize('First Item', '#', true);
    this.insertLast(n);

    n = new NavItem;
    n.initialize('Second Item', '#');
    this.insertLast(n);

    n = new NavItem;
    n.initialize('Third Item', '#');
    this.insertLast(n);
  }

  canTakeChild(component) {
    const Dropdown = require('./Dropdown').default;
    return component instanceof NavItem || component instanceof Dropdown;
  }

  isParentNavbar() {
    return this.parent instanceof NavBar;
  }

  update() {
    this.cssClasses.system = 'nav';
    if (this.isParentNavbar()) {
      this.cssClasses.system += ' navbar-nav';
    } else {
      this.cssClasses.system += ` ${this.properties.type}`;
      if (this.properties.stacked) {
        this.cssClasses.system += ' nav-stacked';
      }
      if (this.properties.justified) {
        this.cssClasses.system += ' nav-justified';
      }
    }

    return super.update();
  }
}

Nav.possibleTypes = [
  { label: 'Tabs', value: 'nav-tabs' },
  { label: 'Pills', value: 'nav-pills' }
];

Nav.suggestedComponents = ['NavItem', 'Dropdown'];

export default Nav;
