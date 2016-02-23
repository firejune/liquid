import InputBase from './InputBase';

class InputNumber extends InputBase {
  constructor() {
    super();
    this.attributes.type = 'number';
    this.addCapabilities(['min', 'max', 'step', 'placeholder', 'size']);
  }
}

InputNumber.prettyName = 'Number Input';

export default InputNumber;
