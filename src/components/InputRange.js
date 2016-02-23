import InputBase from './InputBase';

class InputRange extends InputBase {
  constructor() {
    super();
    this.attributes.type = 'range';
    this.addCapabilities(['min', 'max', 'step']);
    this.removeCapabilities('readonly');
  }

  shouldAddTheFormControlClass() {
    return false;
  }
}

InputRange.prettyName = 'Range Input';

export default InputRange;
