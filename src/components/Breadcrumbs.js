import ComponentWithChildren from './ComponentWithChildren';
import BreadcrumbsItem from './BreadcrumbsItem';

class Breadcrumbs extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<ol>');
    this.cssClasses.system = 'breadcrumb';
  }

  initialize() {
    const bc1 = new BreadcrumbsItem;
    bc1.initialize('Home');
    bc1.properties.href = '#';
    this.insertLast(bc1);

    const bc2 = new BreadcrumbsItem;
    bc2.initialize('Library');
    bc2.properties.href = '#';
    this.insertLast(bc2);

    const bc3 = new BreadcrumbsItem;
    bc3.initialize('Data');
    bc3.properties.href = '#';
    this.insertLast(bc3);
  }

  canTakeChild(component) {
    return component instanceof BreadcrumbsItem;
  }
}

Breadcrumbs.suggestedComponents = ['BreadcrumbsItem'];

export default Breadcrumbs;
