import InputBase from './InputBase';

class InputColor extends InputBase {
  constructor() {
    super();
    this.attributes.type = 'color';
    this.removeCapabilities('readonly');
  }

  shouldAddTheFormControlClass() {
    return false;
  }
}

InputColor.prettyName = 'Color Input';

export default InputColor;
