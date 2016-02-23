import ComponentWithChildren from './ComponentWithChildren';

class Figure extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<figure>');
  }
}

Figure.suggestedComponents = ['Image', 'Figcaption'];

export default Figure;
