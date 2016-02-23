import InputRadioCheckBase from './InputRadioCheckBase';

class InputRadio extends InputRadioCheckBase {
  constructor() {
    super();
    this.attributes.type = 'radio';
  }
}

InputRadio.prettyName = 'Radio';

export default InputRadio;
