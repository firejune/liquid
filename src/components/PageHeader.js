import Div from './Div';
import Heading from './Heading';
import Small from './Small';

class PageHeader extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'page-header';
  }

  initialize() {
    const h = new Heading;
    h.initialize('Page header ');
    this.insertLast(h);

    const s = new Small;
    s.initialize('Subtext for header');
    h.insertLast(s);
  }
}

PageHeader.prettyName = 'Page Header';

export default PageHeader;
