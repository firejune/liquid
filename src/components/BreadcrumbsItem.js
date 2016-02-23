import ComponentWithChildren from './ComponentWithChildren';
import Span from './Span';
import linkOptions from '../helpers/linkOptions';

class BreadcrumbsItem extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<li>');
    this.defineProperties([{
      id: 'active',
      label: 'Active',
      type: 'checkbox',
      value: false
    }]);

    linkOptions.construct(this, '', () => !this.properties.active);
  }

  initialize(txt) {
    const span = new Span;
    span.initialize(txt);
    span.fixate();
    this.insertFirst(span);
  }

  canBeDroppedIn(component) {
    const Breadcrumbs = require('./Breadcrumbs').default;
    return component instanceof Breadcrumbs;
  }

  update() {
    this.cssClasses.system = '';
    if (this.properties.active) {
      this.cssClasses.system = 'active';
    }

    super.startUpdate();

    if (!this.properties.active) {
      const a = document.createElement('a');
      linkOptions.updateDOMNode(this, a);
      this.element.children().appendTo(a);
      this.element.append(a);
    }

    return super.finishUpdate();
  }
}

BreadcrumbsItem.prettyName = 'Breadcrumbs Item';

export default BreadcrumbsItem;
