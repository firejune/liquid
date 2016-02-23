import ComponentWithInlineEditing from './ComponentWithInlineEditing';
// import htmlToInline from '../helpers/htmlToInline';
// import SelectOption from '../panes/SelectOption';
// import TextBoxOption from '../panes/TextBoxOption';
import Anchor from './Anchor';

class Button extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<div>');
    this.blacklist = ['link'];

    this.defineProperties([{
      id: 'type',
      label: 'Element',
      type: 'select',
      value: 'Button',
      visible: () => !this.isParentJustifiedButtonGroup(),
      options: ['Button', 'Link'].map(t => {
        return {
          value: t,
          label: t
        };
      })
    }, {
      id: 'href',
      label: 'Link URL',
      type: 'textbox',
      value: '#',
      visible: () => this.shouldShowAsLink()
    }, {
      id: 'target',
      label: 'Link Target',
      type: 'select',
      value: '',
      options: Anchor.possibleTargets,
      visible: () => this.shouldShowAsLink()
    }, {
      id: 'buttonType',
      label: 'Button Type',
      type: 'select',
      value: Button.buttonTypes[0].value,
      options: Button.buttonTypes,
      visible: () => !this.shouldShowAsLink()
    }, {
      id: 'style',
      label: 'Style',
      type: 'select',
      value: Button.buttonStyles[0].value,
      options: Button.buttonStyles
    }, {
      id: 'size',
      label: 'Size',
      type: 'select',
      value: '',
      options: Button.buttonSizes
    }, {
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    }, {
      id: 'active',
      label: 'Active',
      type: 'checkbox',
      value: false
    }, {
      id: 'block',
      label: 'Block',
      type: 'checkbox',
      value: false
    }]);
  }

  initialize(str = 'Button') {
    super.initialize(str);
  }

  isParentJustifiedButtonGroup() {
    const ButtonGroup = require('./ButtonGroup').default;
    if (this.parent instanceof ButtonGroup && this.parent.properties.justified) {
      return true;
    }
  }

  shouldShowAsLink() {
    if (this.isParentJustifiedButtonGroup()) {
      return true;
    }
    return this.properties.type === 'Link';
  }

  canTakeChild(child) {
    const SplitButton = require('./SplitButton').default;

    return super.canTakeChild(child)
      && !(child instanceof Button)
      && !(child instanceof SplitButton);
  }

  update() {
    let tmp;

    delete this.attributes.role;
    delete this.attributes.href;
    delete this.attributes.target;
    delete this.attributes.type;
    delete this.attributes.disabled;

    this.cssClasses.system = `btn ${this.properties.style}`;

    if (this.shouldShowAsLink()) {
      this.attributes.role = 'button';
      this.attributes.href = this.properties.href;
      if (this.properties.target) {
        this.attributes.target = this.properties.target;
      }
      if (this.properties.disabled) {
        this.cssClasses.system += ' disabled';
      }
      tmp = $('<a>');
    } else {
      this.attributes.type = this.properties.buttonType;
      if (this.properties.disabled) {
        this.attributes.disabled = 'disabled';
      }
      tmp = $('<button>');
    }

    if (this.properties.active) {
      this.cssClasses.system += ' active';
    }

    if (this.properties.block) {
      this.cssClasses.system += ' btn-block';
    }

    if (this.properties.size) {
      this.cssClasses.system += ` ${this.properties.size}`;
    }

    this.element.replaceWith(tmp);
    this.element = tmp;

    return super.update();
  }
}

Button.buttonSizes = [
  { label: 'Large', value: 'btn-lg' },
  { label: 'Default', value: '' },
  { label: 'Small', value: 'btn-sm' },
  { label: 'Extra small', value: 'btn-xs' }
];

Button.buttonStyles = [
  { label: 'Default', value: 'btn-default' },
  { label: 'Primary', value: 'btn-primary' },
  { label: 'Success', value: 'btn-success' },
  { label: 'Info', value: 'btn-info' },
  { label: 'Warning', value: 'btn-warning' },
  { label: 'Danger', value: 'btn-danger' },
  { label: 'Link', value: 'btn-link' }
];

Button.buttonTypes = [
  { label: 'Button', value: 'button' },
  { label: 'Submit', value: 'submit' },
  { label: 'Reset', value: 'reset' }
];

export default Button;
