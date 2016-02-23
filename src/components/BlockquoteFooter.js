import ComponentWithInlineEditing from './ComponentWithInlineEditing';

class BlockquoteFooter extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.element = $('<footer>');
  }

  initialize(txt = 'Someone famous') {
    super.initialize(txt);
  }
}

BlockquoteFooter.prettyName = 'Blockquote Footer';

export default BlockquoteFooter;
