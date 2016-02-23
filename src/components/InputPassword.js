import InputText from './InputText';

class InputPassword extends InputText {
  constructor() {
    super();
    this.attributes.type = 'password';
  }
}

InputPassword.prettyName = 'Password Input';

export default InputPassword;
