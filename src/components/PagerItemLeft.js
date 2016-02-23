import PagerItem from './PagerItem';
// import Anchor from './Anchor';

class PagerItemLeft extends PagerItem {
  constructor() {
    super();
    this.cssClass = 'previous';
  }

  initialize(txt = 'Older') {
    super.initialize(txt);
  }
}

PagerItemLeft.prettyName = 'Pager Item Left';

export default PagerItemLeft;
