import CarouselControlBase from './CarouselControlBase';

class CarouselControlPrevious extends CarouselControlBase {
  constructor() {
    super();
  }

  defineClassSpecificVariables() {
    this.className = 'left';
    this.slide = 'prev';
    this.label = 'Previous';
  }
}

CarouselControlPrevious.prettyName = 'Previous';

export default CarouselControlPrevious;
