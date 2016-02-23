import InputBase from './InputBase';
import SelectOption from '../panes/SelectOption';
import TextBoxOption from '../panes/TextBoxOption';

class InputFile extends InputBase {
  constructor() {
    super();
    this.attributes.type = 'file';
    this.addCapabilities('multiple');
    this.removeCapabilities('readonly');
    this.properties.accept = '';
  }

  focus() {
    super.focus();

    const acceptInput = new TextBoxOption({
      label: 'Custom Accept Value',
      visible: () => !isPossibleAcceptValue(this.properties.accept),
      value: [this.properties, 'accept'],
      component: this,
      history: 'Change Accept Value'
    });

    const validationGroup = app.optionsPane.getById('input-validation');
    validationGroup.add(new SelectOption({
      label: 'Accept',
      value: val => {
        if (val === undefined) {
          if (isPossibleAcceptValue(this.properties.accept)) {
            return this.properties.accept;
          }
          return '__custom';
        }
        if (val === '__custom') {
          acceptInput.val('');
          acceptInput.show();
          return;
        }

        const oldValue = this.properties.accept;
        const newValue = val;

        this.properties.accept = newValue;
        this.update();

        app.context.history.add({
          name: 'Change Accept Value',
          undo: () => {
            this.properties.accept = oldValue;
            this.update();
          },
          redo: () => {
            this.properties.accept = newValue;
            this.update();
          }
        });
      },
      options: InputFile.possibleAcceptValues
    }));

    validationGroup.add(acceptInput);
  }

  shouldAddTheFormControlClass() {
    return false;
  }

  update() {
    delete this.attributes.multiple;
    if (this.properties.multiple) {
      this.attributes.multiple = this.properties.multiple;
    }
    delete this.attributes.accept;
    if (this.properties.accept) {
      this.attributes.accept = this.properties.accept;
    }
    return super.update();
  }
}

function isPossibleAcceptValue(val) {
  const arr = InputFile.possibleAcceptValues;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value === val) {
      return true;
    }
  }
  return false;
}

InputFile.possibleAcceptValues = [
  { label: 'Default', value: '' },
  { label: 'audio/*', value: 'audio/*' },
  { label: 'video/*', value: 'video/*' },
  { label: 'image/*', value: 'image/*' },
  { label: 'Custom..', value: '__custom' }
];

InputFile.prettyName = 'File Input';

export default InputFile;
