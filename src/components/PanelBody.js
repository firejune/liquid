import Div from './Div';
import Span from './Span';

class PanelBody extends Div {
  constructor() {
    super();
    this.cssClasses.system = 'panel-body';
  }

  initialize(txt = 'Panel Body') {
    const span = new Span;
    span.initialize(txt);
    this.insertFirst(span);
  }
}

PanelBody.prettyName = 'Panel Body';

export default PanelBody;
