import Div from './Div';
import Heading from './Heading';

class PanelHeading extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'panel-heading';
  }

  initialize(txt = 'Panel Heading') {
    const heading = new Heading;
    heading.initialize(txt);
    heading.properties.type = 'h3';
    heading.cssClasses.parent = 'panel-title';
    this.insertFirst(heading);
  }
}

PanelHeading.prettyName = 'Panel Heading';

export default PanelHeading;
