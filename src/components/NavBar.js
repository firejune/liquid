import ComponentWithChildren from './ComponentWithChildren';
import SelectOption from '../panes/SelectOption';
import GroupOption from '../panes/GroupOption';
import Button from './Button';
import Paragraph from './Paragraph';
import Anchor from './Anchor';
import NavBarBrand from './NavBarBrand';
import NavBarToggle from './NavBarToggle';

class NavBar extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<nav>');
    this.defineProperties([{
      id: 'style',
      label: 'Style',
      type: 'select',
      value: 'navbar-default',
      options: NavBar.possibleStyles
    }, {
      id: 'position',
      label: 'Position',
      type: 'select',
      value: '',
      options: NavBar.possiblePositions
    }, {
      id: 'fluid',
      label: 'Fluid',
      type: 'checkbox',
      value: true
    }]);
  }

  initialize() {
    const Nav = require('./Nav').default;
    const n = new Nav;
    n.initialize();
    this.insertLast(n);

    const t = new NavBarToggle;
    t.initialize();
    this.insertFirst(t);
    this.properties.showBrand = true;
    this.insertFirst(this.createOrSelectInstance(NavBarBrand));
    this.resetNavCollapseID();
  }

  getCollapseID() {
    return this.getOverride('/0/1', 'id');
  }

  focus() {
    super.focus();

    const navBarOptions = this.getMainOptionsGroup();
    navBarOptions.add(this.createCheckBoxForSubComponent('showBrand', 'Brand',
      NavBarBrand, (parent, child) => {
        parent.insertFirst(child);
      }
    ));
  }

  canTakeChild(component) {
    const Nav = require('./Nav').default;
    const Form = require('./Form').default;
    return component instanceof Nav
      || component instanceof Form
      || component instanceof Anchor
      || component instanceof Button
      || component instanceof Paragraph;
  }

  childFocus(child) {
    const group = new GroupOption({
      id: `${child.constructor.name.toLowerCase()}-in-navbar`,
      label: `${child.getName()} In NavBar`
    });

    app.optionsPane.add(group);
    group.add(new SelectOption({
      id: 'navbarAlignment',
      label: 'Alignment',
      value: [child.properties, 'navbarAlignment', ''],
      options: [{
        label: 'Default',
        value: ''
      }, {
        label: 'Left',
        value: 'navbar-left'
      }, {
        label: 'Right',
        value: 'navbar-right'
      }],
      component: child,
      history: 'Change Alignment In NavBar',
      visible: () => child.parent === this
    }));
  }

  childUpdate(child) {
    let parent = '';
    if (child instanceof Button) {
      parent = 'navbar-btn';
    } else if (child instanceof Paragraph) {
      parent = 'navbar-text';
    }
    if (child.properties.navbarAlignment) {
      parent += ` ${child.properties.navbarAlignment}`;
    }
    child.cssClasses.parent = parent;
  }

  childClean(child) {
    child.cssClasses.parent = '';
    return child;
  }

  undrop(component) {
    return this.childClean(component);
  }

  resetNavCollapseID() {
    this.setOverride('/0/1', 'id', app.canvas.generateUniqueID('navcol'));
  }

  afterDuplicate() {
    super.afterDuplicate();
    this.resetNavCollapseID();
  }

  update() {
    this.cssClasses.system = `navbar ${this.properties.style}`;
    if (this.properties.position) {
      this.cssClasses.system += ` ${this.properties.position}`;
    }

    super.startUpdate();

    const container = $('<div>');
    if (this.properties.fluid) {
      container.addClass('container-fluid');
    } else {
      container.addClass('container');
    }

    const navbarHeader = $('<div class="navbar-header">');
    container.append(navbarHeader);
    if (this.properties.showBrand) {
      this.element.children().first().appendTo(navbarHeader);
    }

    this.element.children().first().appendTo(navbarHeader);

    const collapse = $('<div class="collapse navbar-collapse">');
    container.append(collapse);
    this.element.children().appendTo(collapse);
    this.element.empty();
    this.element.append(container);

    return super.finishUpdate();
  }
}

NavBar.possibleStyles = [
  { label: 'Default', value: 'navbar-default' },
  { label: 'Inverted colors', value: 'navbar-inverse' }
];

NavBar.possiblePositions = [
  { label: 'Default', value: '' },
  { label: 'Fixed to top', value: 'navbar-fixed-top' },
  { label: 'Fixed to bottom', value: 'navbar-fixed-bottom' },
  { label: 'Static top', value: 'navbar-static-top' }
];

NavBar.prettyName = 'Navbar';

NavBar.suggestedComponents = ['Nav', 'NavItem', 'Dropdown', 'Paragraph', 'Anchor', 'Button'];

export default NavBar;
