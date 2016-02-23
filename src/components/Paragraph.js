import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import textOptions from '../helpers/textOptions';

export default class Paragraph extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.element = $('<p>');
    this.defineProperties([{
      id: 'text-lead',
      label: 'Lead',
      type: 'checkbox',
      value: false
    }]);

    this.cssClasses.system = {};
    textOptions.construct(this);
  }

  initialize(str = 'Paragraph') {
    super.initialize(str);
  }

  update() {
    delete this.cssClasses.system.lead;
    if (this.properties['text-lead']) {
      this.cssClasses.system.lead = 'lead';
    }

    textOptions.update(this);

    return super.update();
  }
}
