import ComponentWithChildren from './ComponentWithChildren';
import Heading from './Heading';

class Hgroup extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<hgroup>');
  }

  canTakeChild(child) {
    return super.canTakeChild(child) && child instanceof Heading;
  }
}

Hgroup.suggestedComponents = ['Heading'];

export default Hgroup;
