import ComponentWithChildren from './ComponentWithChildren';

export default class Aside extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<aside>');
  }
}
