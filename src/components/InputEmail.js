import InputText from './InputText';

class InputEmail extends InputText {
  constructor() {
    super();
    this.attributes.type = 'email';
    this.addCapabilities('multiple');
  }
}

InputEmail.prettyName = 'Email Input';

export default InputEmail;
