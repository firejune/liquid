import ComponentWithChildren from './ComponentWithChildren';
import Anchor from './Anchor';

class PagerItem extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<li>');

    this.defineProperties({
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    });

    this.cssClass = '';
    this.fixate();
  }

  canTakeChild() {
    return false;
  }

  initialize(txt) {
    const link = new Anchor;
    link.initialize(txt);
    link.fixate();
    this.insertFirst(link);
  }

  update() {
    this.cssClasses.system = '';
    if (this.parent.properties.distributed) {
      this.cssClasses.system = this.cssClass;
    }
    if (this.properties.disabled) {
      this.cssClasses.system += ' disabled';
    }

    return super.update();
  }
}

PagerItem.prettyName = 'Pager Item';

export default PagerItem;
