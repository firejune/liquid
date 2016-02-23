import ComponentWithChildren from './ComponentWithChildren';

export default class Article extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<article>');
  }
}
