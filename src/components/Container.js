import ComponentWithChildren from './ComponentWithChildren';

export default class Container extends ComponentWithChildren {
  constructor() {
    super();

    this.element = $('<div>');
    this.defineProperties({
      id: 'fluid',
      label: 'Fluid',
      type: 'checkbox',
      value: false
    });
  }

  canBeDroppedIn(component) {
    return super.canBeDroppedIn(component)
      && !(component instanceof Container)
      && !component.hasParent(Container);
  }

  update() {
    this.cssClasses.system = 'container';
    if (this.properties.fluid) {
      this.cssClasses.system = 'container-fluid';
    }

    return super.update();
  }
}
