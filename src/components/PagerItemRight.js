import PagerItem from './PagerItem';
// import Anchor from './Anchor';

class PagerItemRight extends PagerItem {
  constructor() {
    super();
    this.cssClass = 'next';
  }

  initialize(txt = 'Newer') {
    super.initialize(txt);
  }
}

PagerItemRight.prettyName = 'Pager Item Right';

export default PagerItemRight;
