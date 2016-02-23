import ComponentWithChildren from './ComponentWithChildren';

class Section extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<section>');
  }
}

export default Section;
