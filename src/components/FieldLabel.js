import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import htmlToInline from '../helpers/htmlToInline';
// import FormGroup from './FormGroup';

class FieldLabel extends ComponentWithInlineEditing {
  constructor() {
    super();

    this.inline = true;
    this.element = $('<label>');

    this.defineProperties({
      id: 'for',
      label: 'For',
      type: 'textbox',
      value: '',
      history: 'Change Label \'For\' Attribute'
    });
  }

  initialize(text = 'Label') {
    this.children = htmlToInline(text);
  }

  afterDuplicate() {
    if (this.properties.for) {
      setTimeout(() => {
        if (this.properties.for in app.changedIDMap) {
          this.properties.for = app.changedIDMap[this.properties.for];
        }
      }, 0);
    }
  }

  canTakeChild(c) {
    return super.canTakeChild(c) && !(c instanceof FieldLabel);
  }

  update() {
    delete this.attributes.for;
    if (this.properties.for) {
      this.attributes.for = this.properties.for;
    }

    this.cssClasses.system = '';
    if (this.hasParent(require('./FormGroup').default)) {
      this.cssClasses.system = 'control-label';
    }

    return super.update();
  }
}

FieldLabel.prettyName = 'Field Label';

export default FieldLabel;
