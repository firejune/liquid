import ComponentWithChildren from './ComponentWithChildren';
import CarouselControlPrevious from './CarouselControlPrevious';
import CarouselControlNext from './CarouselControlNext';

class CarouselControls extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
  }

  initialize() {
    const previous = new CarouselControlPrevious;
    previous.initialize();
    previous.fixate();

    const next = new CarouselControlNext;
    next.initialize();
    next.fixate();
    this.insertFirst(previous);
    this.insertLast(next);
  }

  canTakeChild() {
    return false;
  }
}

CarouselControls.prettyName = 'Controls';

export default CarouselControls;
