import ComponentWithChildren from './ComponentWithChildren';
import Heading from './Heading';
import Paragraph from './Paragraph';

class MediaBody extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.cssClasses.system = 'media-body';
  }

  initialize() {
    const h = new Heading;
    h.initialize('Media Heading');
    h.properties.type = 'h4';
    h.cssClasses.parent = 'media-heading';
    this.insertFirst(h);

    const p = new Paragraph;
    p.initialize(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Duis maximus nisl ac diam feugiat, non vestibulum libero posuere. ' +
      'Vivamus pharetra leo non nulla egestas, nec malesuada orci finibus. '
    );
    this.insertLast(p);
  }

  drop(component) {
    if (component instanceof Heading) {
      component.cssClasses.parent = 'media-heading';
    }
    return component;
  }

  undrop(component) {
    component.cssClasses.parent = '';
    return component;
  }
}

MediaBody.prettyName = 'Media Body';

export default MediaBody;
