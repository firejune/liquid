import Anchor from './Anchor';

class NavBarBrand extends Anchor {
  constructor() {
    super();
    this.fixate();
    this.cssClasses.system.main = 'navbar-brand';
  }

  initialize(txt = 'Brand') {
    super.initialize(txt);
  }
}

NavBarBrand.prettyName = 'Navbar Brand';

export default NavBarBrand;
