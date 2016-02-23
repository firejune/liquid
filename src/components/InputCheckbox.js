import InputRadioCheckBase from './InputRadioCheckBase';

class InputCheckbox extends InputRadioCheckBase {
  constructor() {
    super();
    this.attributes.type = 'checkbox';
  }
}

InputCheckbox.prettyName = 'Checkbox';

export default InputCheckbox;
