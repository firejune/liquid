import Paragraph from './Paragraph';

class HelpTextBlock extends Paragraph {
  constructor() {
    super();
    this.cssClasses.system.main = 'help-block';
  }

  initialize(str = 'Help text for a form field.') {
    super.initialize(str);
  }
}

HelpTextBlock.prettyName = 'Help Text Block';

export default HelpTextBlock;
