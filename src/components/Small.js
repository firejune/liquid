import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import textOptions from '../helpers/textOptions';

class Small extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<small>');

    textOptions.construct(this, {
      includeAlignment: false,
      includeNowrap: false
    });
  }

  update() {
    this.cssClasses.system = {};
    textOptions.update(this);
    return super.update();
  }
}

export default Small;
