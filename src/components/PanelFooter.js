import Div from './Div';
import Span from './Span';

class PanelFooter extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'panel-footer';
  }

  initialize(txt = 'Panel Footer') {
    const span = new Span;
    span.initialize(txt);
    this.insertFirst(span);
  }
}

PanelFooter.prettyName = 'Panel Footer';

export default PanelFooter;
