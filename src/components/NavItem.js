import ComponentWithChildren from './ComponentWithChildren';
import Anchor from './Anchor';

class NavItem extends ComponentWithChildren {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<li>');
    this.defineProperties([{
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    }, {
      id: 'active',
      label: 'Active',
      type: 'checkbox',
      value: false
    }]);
  }

  initialize(text, url, active = false, disabled = false) {
    const link = new Anchor;
    link.initialize(text, url);
    link.fixate();
    this.insertFirst(link);
    this.properties.disabled = disabled;
    this.properties.active = active;
  }

  /**
   * @param component
   */
  canTakeChild() {
    return false;
  }

  canBeDroppedIn(component) {
    const Nav = require('./Nav').default;
    return super.canBeDroppedIn(component) && component instanceof Nav;
  }

  update() {
    this.cssClasses.system = '';
    if (this.properties.disabled) {
      this.cssClasses.system += 'disabled ';
    }

    if (this.properties.active) {
      this.cssClasses.system += 'active';
    }
    delete this.attributes.role;

    if (this.parent.isParentNavbar()) {
      this.attributes.role = 'presentation';
    }

    return super.update();
  }
}

NavItem.prettyName = 'Nav Item';

export default NavItem;
