import ComponentWithChildren from './ComponentWithChildren';
import CarouselSlide from './CarouselSlide';

class CarouselSlides extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.cssClasses.system = 'carousel-inner';
    this.attributes.role = 'listbox';
  }

  initialize() {
    this.addSlideOp().do();
    this.addSlideOp().do();
    this.addSlideOp().do();
  }

  addSlideOp() {
    const slide = new CarouselSlide;
    slide.initialize();

    return {
      undo: () => {
        this.removeChild(slide);
      },
      'do': () => {
        this.insertLast(slide);
      }
    };
  }

  canTakeChild(comp) {
    return super.canTakeChild(comp) && comp instanceof CarouselSlide;
  }

  update() {
    if (this.parent.children[2]) {
      this.parent.children[2].update();
    }

    return super.update();
  }
}

CarouselSlides.prettyName = 'Slides';

export default CarouselSlides;
