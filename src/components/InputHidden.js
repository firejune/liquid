import InputBase from './InputBase';

class InputHidden extends InputBase {
  constructor() {
    super();
    this.attributes.type = 'hidden';
    this.removeCapabilities(['readonly', 'required', 'disabled']);
  }
}

InputHidden.prettyName = 'Hidden Input';

export default InputHidden;
