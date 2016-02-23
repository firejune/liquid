import Div from './Div';
import Heading from './Heading';
import Paragraph from './Paragraph';
import Button from './Button';

class Jumbotron extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'jumbotron';
  }

  initialize() {
    const h = new Heading;
    h.initialize('Heading text');
    this.insertLast(h);

    const p = new Paragraph;
    p.initialize(
      'Nullam id dolor id nibh ultricies vehicula ut id elit. ' +
      'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
    );
    this.insertLast(p);

    const p2 = new Paragraph;
    p2.initialize('');
    this.insertLast(p2);

    const b = new Button;
    b.properties.type = 'Link';
    b.initialize('Learn more');
    p2.insertLast(b);
  }
}

export default Jumbotron;
