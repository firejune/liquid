import InputBase from './InputBase';

export default class InputRadioCheckBase extends InputBase {
  constructor() {
    super();
    this.attributes.type = '';
    this.addCapabilities('checked');
    this.removeCapabilities('readonly');
  }

  shouldAddTheFormControlClass() {
    return false;
  }

  update() {
    this.element.prop('checked', this.properties.checked);
    return super.update();
  }
}
