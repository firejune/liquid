import Component from './Component';
import ComponentWithInlineEditing from './ComponentWithInlineEditing';
// import Form from './Form';
// import InputGroup from './InputGroup';

class InputBase extends Component {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<input>');
    this.defineGroups([{
      id: 'input-main',
      label: 'Main',
      weight: 10
    }, {
      id: 'input-state',
      label: 'State',
      weight: 20
    }, {
      id: 'input-input',
      label: 'Input',
      collapsed: true,
      weight: 20
    }, {
      id: 'input-validation',
      label: 'Validation',
      collapsed: true,
      weight: 20
    }]);
    this.addCapabilities(['name', 'value', 'disabled', 'readonly', 'required']);
  }

  canBeDroppedIn(parent) {
    return super.canBeDroppedIn(parent) && !(parent instanceof ComponentWithInlineEditing);
  }

  addCapabilities(arr) {
    if (!Array.isArray(arr)) {
      arr = [arr];
    }

    this.defineProperties(arr.map(i => inputCapabilities[i]));
  }

  removeCapabilities(arr) {
    this.deleteProperties(arr);
  }

  shouldAddTheFormControlClass() {
    const Form = require('./Form').default;
    const InputGroup = require('./InputGroup').default;
    return this.hasParent(Form) || this.parent instanceof InputGroup;
  }

  update() {
    this.cssClasses.system = '';
    if (this.shouldAddTheFormControlClass()) {
      this.cssClasses.system += ' form-control';
    }

    if (this.properties.size) {
      this.cssClasses.system += ` input-${this.properties.size}`;
    }

    delete this.attributes.name;
    delete this.attributes.value;
    delete this.attributes.disabled;
    delete this.attributes.readonly;
    delete this.attributes.required;
    delete this.attributes.checked;
    delete this.attributes.multiple;
    delete this.attributes.placeholder;
    delete this.attributes.maxlength;
    delete this.attributes.minlength;
    delete this.attributes.pattern;
    delete this.attributes.autofocus;
    delete this.attributes.autocomplete;
    delete this.attributes.inputmode;
    delete this.attributes.min;
    delete this.attributes.max;
    delete this.attributes.step;

    if (this.properties.name) {
      this.attributes.name = this.properties.name;
    }

    if (this.properties.value) {
      this.attributes.value = this.properties.value;
    }

    if (this.properties.disabled) {
      this.attributes.disabled = '';
    }

    if (this.properties.readonly) {
      this.attributes.readonly = '';
    }

    if (this.properties.required) {
      this.attributes.required = '';
    }

    if (this.properties.checked) {
      this.attributes.checked = '';
    }

    if (this.properties.multiple) {
      this.attributes.multiple = '';
    }

    if (this.properties.placeholder) {
      this.attributes.placeholder = this.properties.placeholder;
    }

    if (this.properties.maxlength > 0) {
      this.attributes.maxlength = this.properties.maxlength;
    }

    if (this.properties.minlength > 0) {
      this.attributes.minlength = this.properties.minlength;
    }

    if (this.properties.pattern) {
      this.attributes.pattern = this.properties.pattern;
    }

    if (this.properties.autofocus) {
      this.attributes.autofocus = '';
    }

    if (this.properties.autocomplete) {
      this.attributes.autocomplete = this.properties.autocomplete;
    }

    if (this.properties.inputmode) {
      this.attributes.inputmode = this.properties.inputmode;
    }

    if (this.properties.min) {
      this.attributes.min = this.properties.min;
    }

    if (this.properties.max) {
      this.attributes.max = this.properties.max;
    }

    if (this.properties.step) {
      this.attributes.step = this.properties.step;
    }

    return super.update();
  }
}

InputBase.possibleSizes = [
  { label: 'Default', value: '' },
  { label: 'Large', value: 'lg' },
  { label: 'Small', value: 'sm' }
];

InputBase.possibleAutocompleteValues = [
  { label: 'Default', value: '' },
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' }
];

InputBase.possibleInputModeValues = [
  { label: 'Default', value: '' },
  { label: 'Verbatim', value: 'verbatim' },
  { label: 'Latin', value: 'latin' },
  { label: 'Latin name', value: 'latin-name' },
  { label: 'Latin prose', value: 'latin-prose' },
  { label: 'Full width latin', value: 'full-width-latin' },
  { label: 'Kana', value: 'kana' },
  { label: 'Katakana', value: 'katakana' },
  { label: 'Numeric', value: 'numeric' },
  { label: 'Tel', value: 'tel' },
  { label: 'Email', value: 'email' },
  { label: 'Url', value: 'url' }
];

const inputCapabilities = {
  name: { id: 'name', label: 'Name', type: 'textbox', value: '', group: 'input-main' },
  value: { id: 'value', label: 'Value', type: 'textbox', value: '', group: 'input-main' },
  disabled: { id: 'disabled', label: 'Disabled', type: 'checkbox', value: false, group: 'input-state' },
  readonly: { id: 'readonly', label: 'Readonly', type: 'checkbox', value: false, group: 'input-state' },
  required: { id: 'required', label: 'Required', type: 'checkbox', value: false, group: 'input-validation' },
  checked: { id: 'checked', label: 'Checked', type: 'checkbox', value: false, group: 'input-main' },
  multiple: { id: 'multiple', label: 'Multiple', type: 'checkbox', value: false, group: 'input-input' },
  size: { id: 'size', label: 'Size', type: 'select', value: '', options: InputBase.possibleSizes, group: 'input-main' },
  placeholder: { id: 'placeholder', label: 'Placeholder', type: 'textbox', value: '', group: 'input-main' },
  maxlength: { id: 'maxlength', label: 'Max Length', type: 'textbox', value: '', group: 'input-validation' },
  minlength: { id: 'minlength', label: 'Min Length', type: 'textbox', value: '', group: 'input-validation' },
  pattern: { id: 'pattern', label: 'Validation Pattern', type: 'textbox', value: '', group: 'input-validation' },
  autofocus: { id: 'autofocus', label: 'Autofocus', type: 'checkbox', value: false, group: 'input-input' },
  autocomplete: { id: 'autocomplete', label: 'Autocomplete', type: 'select', value: '', group: 'input-input', options: InputBase.possibleAutocompleteValues },
  inputmode: { id: 'inputmode', label: 'Input Mode', type: 'select', value: '', group: 'input-input', options: InputBase.possibleInputModeValues },
  min: { id: 'min', label: 'Min', type: 'textbox', value: '', group: 'input-main' },
  max: { id: 'max', label: 'Max', type: 'textbox', value: '', group: 'input-main' },
  step: { id: 'step', label: 'Step', type: 'textbox', value: '', group: 'input-main' }
};

export default InputBase;
