import InputText from './InputText';

class InputURL extends InputText {
  constructor() {
    super();
    this.attributes.type = 'url';
  }
}

InputURL.prettyName = 'URL Input';

export default InputURL;
