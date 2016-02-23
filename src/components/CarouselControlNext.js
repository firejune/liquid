import CarouselControlBase from './CarouselControlBase';

class CarouselControlNext extends CarouselControlBase {
  constructor() {
    super();
  }

  defineClassSpecificVariables() {
    this.className = 'right';
    this.slide = 'next';
    this.label = 'Next';
  }
}

CarouselControlNext.prettyName = 'Next';

export default CarouselControlNext;
