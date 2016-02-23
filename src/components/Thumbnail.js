import Div from './Div';
import Image from './Image';
import Heading from './Heading';
import Paragraph from './Paragraph';

class Thumbnail extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'thumbnail';
  }

  initialize() {
    const img = new Image;
    img.initialize();
    this.insertFirst(img);

    const div = new Div;
    div.initialize();
    div.setOverride('/', 'class', 'caption');
    this.insertLast(div);

    const h = new Heading;
    h.initialize('Thumbnail label');
    h.properties.type = 'h3';
    div.insertLast(h);

    const p = new Paragraph;
    p.initialize(
      'Nullam id dolor id nibh ultricies vehicula ut id elit. ' +
      'Cras justo odio, dapibus ac facilisis in, egestas eget quam. ' +
      'Donec id elit non mi porta gravida at eget metus.'
    );
    div.insertLast(p);
  }
}

export default Thumbnail;
