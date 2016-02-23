import InputBase from './InputBase';

class InputText extends InputBase {
  constructor() {
    super();
    this.attributes.type = 'text';
    this.addCapabilities([
      'size', 'placeholder', 'maxlength', 'minlength', 'pattern', 'autofocus', 'autocomplete',
      'inputmode'
    ]);
  }
}

InputText.prettyName = 'Text Input';

export default InputText;
