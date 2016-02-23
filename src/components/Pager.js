import ComponentWithChildren from './ComponentWithChildren';
import PagerItemLeft from './PagerItemLeft';
import PagerItemRight from './PagerItemRight';

export default class Pager extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<nav>');
    this.defineProperties([{
      id: 'distributed',
      label: 'Distributed',
      type: 'checkbox',
      value: true
    }]);
  }

  initialize() {
    this.properties.showPagerItemLeft = true;
    this.properties.showPagerItemRight = true;
    this.insertFirst(this.createOrSelectInstance(PagerItemLeft));
    this.insertLast(this.createOrSelectInstance(PagerItemRight));
  }

  canTakeChild() {
    return false;
  }

  focus() {
    super.focus();

    const pagerOptions = this.getMainOptionsGroup();
    pagerOptions.add(this.createCheckBoxForSubComponent('showPagerItemLeft', 'Page Left',
      PagerItemLeft, (parent, child) => {
        parent.insertFirst(child);
      }
    ));
    pagerOptions.add(this.createCheckBoxForSubComponent('showPagerItemRight', 'Page Right',
      PagerItemRight, (parent, child) => {
        parent.insertLast(child);
      }
    ));
  }

  update() {
    super.startUpdate();

    const ul = $('<ul class="pager">');
    if (this.properties.size) {
      ul.addClass(this.properties.size);
    }
    this.element.children().appendTo(ul);
    this.element.append(ul);

    return super.finishUpdate();
  }
}
