import InputBase from './InputBase';

class InputTextarea extends InputBase {
  constructor() {
    super();
    this.element = $('<textarea>');

    this.defineProperties({
      id: 'textValue',
      label: 'Value',
      type: 'textbox',
      value: '',
      group: 'input-main'
    });

    this.addCapabilities([
      'size', 'placeholder', 'maxlength', 'minlength', 'autofocus', 'autocomplete', 'inputmode'
    ]);
    this.removeCapabilities('value');

    this.defineProperties({
      id: 'rows',
      label: 'Rows',
      type: 'textbox',
      value: '',
      group: 'input-main'
    });
    this.defineProperties({
      id: 'cols',
      label: 'Columns',
      type: 'textbox',
      value: '',
      group: 'input-main'
    });
    this.defineProperties({
      id: 'spellcheck',
      label: 'Spellcheck',
      type: 'select',
      value: '',
      options: InputTextarea.possibleSpellcheckValues,
      group: 'input-input'
    });
    this.defineProperties({
      id: 'wrap',
      label: 'Wrap text',
      type: 'checkbox',
      value: false,
      group: 'input-input'
    });
  }

  update() {
    delete this.attributes.rows;
    delete this.attributes.cols;
    delete this.attributes.spellcheck;
    delete this.attributes.wrap;

    if (this.properties.rows) {
      this.attributes.rows = this.properties.rows;
    }

    if (this.properties.cols) {
      this.attributes.cols = this.properties.cols;
    }

    if (this.properties.wrap) {
      this.attributes.wrap = 'hard';
    }

    if (this.properties.spellcheck) {
      this.attributes.spellcheck = this.properties.spellcheck;
    }

    this.element[0].textContent = this.properties.textValue;

    return super.update();
  }
}

InputTextarea.possibleSpellcheckValues = [
  { label: 'Default', value: '' },
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' }
];

InputTextarea.prettyName = 'Textarea';

export default InputTextarea;
