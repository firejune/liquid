import RadioCheckHolderBase from './RadioCheckHolderBase';
import InputCheckbox from './InputCheckbox';

class CheckboxHolder extends RadioCheckHolderBase {
  constructor() {
    super();
    this.inlineClass = 'checkbox-inline';
    this.regularClass = 'checkbox';
    this.ComponentConstructor = InputCheckbox;
  }

  removeCheckbox() {
    return this.removeMainComponent();
  }
}

CheckboxHolder.prettyName = 'Checkbox Holder';

export default CheckboxHolder;
