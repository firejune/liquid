import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import Figure from './Figure';

export default class Figcaption extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.element = $('<figcaption>');
  }

  canBeDroppedIn(parent) {
    return super.canBeDroppedIn(parent) && parent instanceof Figure;
  }

  initialize(txt = 'Caption') {
    super.initialize(txt);
  }
}
