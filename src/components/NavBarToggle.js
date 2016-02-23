import ComponentWithChildren from './ComponentWithChildren';
import Span from './Span';

class NavBarToggle extends ComponentWithChildren {
  constructor() {
    super();
    this.fixate();
    this.element = $('<button>');
    this.inline = true;
    this.cssClasses.system = 'navbar-toggle collapsed';
  }

  initialize() {
    super.initialize();

    let sp = new Span;
    sp.initialize('Toggle navigation');
    sp.properties['sr-only'] = true;
    this.insertLast(sp);

    sp = new Span;
    sp.initialize('');
    sp.setOverride('/', 'class', 'icon-bar');
    this.insertLast(sp);

    sp = new Span;
    sp.initialize('');
    sp.setOverride('/', 'class', 'icon-bar');
    this.insertLast(sp);

    sp = new Span;
    sp.initialize('');
    sp.setOverride('/', 'class', 'icon-bar');
    this.insertLast(sp);
  }

  canTakeChild(component) {
    return super.canTakeChild(component) && component.inline;
  }

  getNavBarID() {
    if (!this.parent) return;
    return this.parent.getCollapseID();
  }

  update() {
    this.attributes['data-toggle'] = 'collapse';
    this.attributes['data-target'] = `#${this.getNavBarID()}`;
    return super.update();
  }
}

NavBarToggle.prettyName = 'Navbar Toggle';

export default NavBarToggle;
