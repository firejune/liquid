import ComponentWithInlineEditing from './ComponentWithInlineEditing';

export default class Badge extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<span>');
    this.cssClasses.system = 'badge';
  }
  canTakeChild(component) {
    return super.canTakeChild(component) && !(component instanceof Badge);
  }

  initialize(txt = '42') {
    super.initialize(txt);
  }
}
