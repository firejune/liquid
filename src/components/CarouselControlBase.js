import ComponentWithInlineEditing from './ComponentWithChildren';
import Icon from './Icon';
import Span from './Span';

export default class CarouselControlBase extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.element = $('<a>');
    this.defineClassSpecificVariables();
    this.cssClasses.system = `${this.className} carousel-control`;
  }

  getCarouselID() {
    if (this.parent && this.parent.parent) {
      return this.parent.parent.getCarouselID();
    }
    return '';
  }

  defineClassSpecificVariables() {
    this.className = 'left';
    this.slide = 'prev';
    this.label = 'Previous';
  }

  initialize() {
    const ico = new Icon;
    ico.initialize();
    ico.properties.icon = `glyphicon glyphicon-chevron-${this.className}`;
    this.insertFirst(ico);

    const sp = new Span;
    sp.initialize(this.label);
    sp.properties['sr-only'] = true;
    this.insertLast(sp);
  }

  update() {
    this.attributes.href = `#${this.getCarouselID()}`;
    this.attributes.role = 'button';
    this.attributes['data-slide'] = this.slide;

    return super.update();
  }
}
