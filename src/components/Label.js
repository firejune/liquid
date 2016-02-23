import ComponentWithInlineEditing from './ComponentWithInlineEditing';

class Label extends ComponentWithInlineEditing {
  constructor() {
    super();

    this.inline = true;
    this.element = $('<span>');

    this.defineProperties({
      id: 'style',
      label: 'Style',
      type: 'select',
      value: 'label-default',
      options: Label.possibleStyles
    });
  }

  canTakeChild(component) {
    return super.canTakeChild(component) && !(component instanceof Label);
  }

  initialize(txt = 'Label') {
    super.initialize(txt);
  }

  update() {
    this.cssClasses.system = `label ${this.properties.style}`;
    return super.update();
  }
}

Label.possibleStyles = [
  { label: 'Default', value: 'label-default' },
  { label: 'Primary', value: 'label-primary' },
  { label: 'Success', value: 'label-success' },
  { label: 'Info', value: 'label-info' },
  { label: 'Warning', value: 'label-warning' },
  { label: 'Danger', value: 'label-danger' }
];

export default Label;
