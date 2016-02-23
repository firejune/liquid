import InputText from './InputText';

class InputTel extends InputText {
  constructor() {
    super();
    this.attributes.type = 'tel';
  }
}

InputTel.prettyName = 'Telephone Input';

export default InputTel;
