import RadioCheckHolderBase from './RadioCheckHolderBase';
import InputRadio from './InputRadio';

class RadioHolder extends RadioCheckHolderBase {
  constructor() {
    super();
    this.inlineClass = 'radio-inline';
    this.regularClass = 'radio';
    this.ComponentConstructor = InputRadio;
  }

  removeRadio() {
    return this.removeMainComponent();
  }
}

RadioHolder.prettyName = 'Radio Holder';

export default RadioHolder;
