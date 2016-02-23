import Component from './Component';
import escapeHTML from 'escape-html';

class CarouselIndicators extends Component {
  constructor() {
    super();
    this.element = $('<ol>');
    this.cssClasses.system = 'carousel-indicators';
  }

  update() {
    const slides = this.parent.children[0].children;
    const carouselID = this.parent.getCarouselID();
    const build = [];
    let active;
    let escapedID;

    for (let i = 0; i < slides.length; i++) {
      if (this.parent.isSlideActive(slides[i])) {
        active = ' class="active"';
      } else {
        active = '';
      }
      escapedID = escapeHTML(carouselID);
      build.push(`<li data-target="#${escapedID}" data-slide-to="${i}"${active}"></li>`);
    }
    this.element.html(build.join(' '));

    return super.update();
  }
}

CarouselIndicators.prettyName = 'Indicators';

export default CarouselIndicators;
