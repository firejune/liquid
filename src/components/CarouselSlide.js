import ComponentWithChildren from './ComponentWithChildren';
import Image from './Image';
import CarouselCaption from './CarouselCaption';

class CarouselSlide extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
  }

  isActive() {
    if (this.parent && this.parent.parent) {
      return this.parent.parent.isSlideActive(this);
    }
    return false;
  }

  slideName() {
    const src = this.children[0].properties.src;
    if (src.indexOf('placeholdit.imgix.net') !== -1) {
      return 'Empty Slide';
    }

    if (/.(jpe?g|png|gif)$/i.test(src)) {
      const imageName = src.match(/([\w\d-_]+).(jpe?g|png|gif)$/i);
      if (imageName && Array.isArray(imageName) && imageName[1]) {
        return imageName[1];
      }
    }

    return 'Slide';
  }

  initialize() {
    this.insertFirst(this.createOrSelectInstance(Image));

    this.children[0].properties.src =
      'http://placeholdit.imgix.net/~text?txtsize=42&txt=Carousel+Image&w=1400&h=600';

    this.children[0].properties.alt = 'Slide Image';
  }

  canBeDroppedIn(component) {
    const CarouselSlides = require('./CarouselSlides').default;
    return super.canBeDroppedIn(component) && component instanceof CarouselSlides;
  }

  /**
   * @param child
   */
  canTakeChild() {
    return false;
  }

  focus() {
    super.focus();
    const slideOptions = this.getMainOptionsGroup();
    slideOptions.add(this.createCheckBoxForSubComponent('showCaption', 'Caption',
      CarouselCaption,
      /**
       * @param parent
       * @param child
       * @param [index=-1]
       */
      (parent, child) => {
        parent.insertLast(child);
      }
    ));
  }

  update() {
    this.cssClasses.system = 'item';
    if (this.isActive()) {
      this.cssClasses.system += ' active';
    }

    return super.update();
  }
}

CarouselSlide.prettyName = 'Slide';

export default CarouselSlide;
