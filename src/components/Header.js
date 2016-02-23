import ComponentWithChildren from './ComponentWithChildren';

export default class Header extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<header>');
  }
}
