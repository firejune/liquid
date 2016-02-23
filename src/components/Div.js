import ComponentWithChildren from './ComponentWithChildren';

export default class Div extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
  }
}
