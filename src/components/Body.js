import ComponentWithChildren from './ComponentWithChildren';

export default class Body extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<body>');
    this.fixate();
  }

  canBeDroppedIn() {
    return false;
  }
}
