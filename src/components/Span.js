import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import textOptions from '../helpers/textOptions';

class Span extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<span>');

    textOptions.construct(this, {
      includeAlignment: false,
      includeNowrap: false
    });
    this.cssClasses.system = {};
  }

  update() {
    textOptions.update(this);
    return super.update();
  }
}

export default Span;
