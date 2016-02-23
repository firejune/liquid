import Paragraph from './Paragraph';

class StaticControl extends Paragraph {
  constructor() {
    super();
    this.cssClasses.system.main = 'form-control-static';
  }

  initialize(str = 'Static Value') {
    super.initialize(str);
  }
}

StaticControl.prettyName = 'Static Control';

export default StaticControl;
