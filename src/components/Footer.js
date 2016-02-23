import ComponentWithChildren from './ComponentWithChildren';

export default class Footer extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<footer>');
  }
}
