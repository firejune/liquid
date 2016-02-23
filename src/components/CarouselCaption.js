import Div from './Div';
import Paragraph from './Paragraph';
import Heading from './Heading';

class CarouselCaption extends Div {
  constructor() {
    super();
    this.element = $('<div>');
    this.cssClasses.system = 'carousel-caption';
  }

  initialize() {
    const h = new Heading;
    h.initialize('Slide Title');
    h.properties.type = 'h3';
    this.insertLast(h);

    const p = new Paragraph;
    p.initialize('Slide Caption');
    this.insertLast(p);
  }
}

CarouselCaption.prettyName = 'Caption';

export default CarouselCaption;
