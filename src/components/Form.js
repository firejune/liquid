import ComponentWithChildren from './ComponentWithChildren';
import InputCheckbox from './InputCheckbox';
import InputRadio from './InputRadio';
import CheckboxHolder from './CheckboxHolder';
import RadioHolder from './RadioHolder';
import NavBar from './NavBar';
import FormGroup from './FormGroup';
// import FieldLabel from './FieldLabel';
// import InputText from './InputText';
// import Button from './Button';
import SelectOption from '../panes/SelectOption';
import wrapInAutomaticElement from '../helpers/wrapInAutomaticElement';

class Form extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<form>');
    this.properties.type = '';
    this.defineProperties([{
      id: 'action',
      label: 'Action',
      type: 'textbox',
      value: ''
    }, {
      id: 'method',
      label: 'Method',
      type: 'select',
      value: '',
      options: Form.possibleMethods
    }, {
      id: 'target',
      label: 'Target',
      type: 'select',
      value: '',
      options: Form.possibleTargets
    }, {
      id: 'enctype',
      label: 'Encoding',
      type: 'select',
      value: '',
      options: Form.possibleEnctypes
    }]);
  }

  canTakeChild(child) {
    return !(child instanceof Form);
  }

  focus() {
    super.focus();

    const formOptionsGroup = this.getMainOptionsGroup();
    formOptionsGroup.add(new SelectOption({
      label: 'Type',
      visible: () => !(this.parent instanceof NavBar),
      value: [this.properties, 'type'],
      // FIXED: OPTIONS 패널에서 FORM을 클릭하면 발생하는 오류 수정
      options: Form.possibleTypes,
      onChange: (newValue, oldValue) => {
        const subEntries = [];
        if (oldValue !== 'form-horizontal' && newValue === 'form-horizontal') {
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof FormGroup) {
              subEntries.push(this.children[i].convertToHorizontalFormat());
            }
          }
        } else if (oldValue === 'form-horizontal' && newValue !== 'form-horizontal') {
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof FormGroup) {
              subEntries.push(this.children[i].convertToRegularFormat());
            }
          }
        }
        this.properties.type = newValue;
        this.update();
        app.context.history.add({
          name: 'Change Form Type',
          undo: () => {
            this.properties.type = oldValue;
            subEntries.forEach(e => e.undo());
            this.update();
          },
          redo: () => {
            this.properties.type = newValue;
            subEntries.forEach(e => e.redo());
            this.update();
          }
        });
      }
    }), 0);
  }

  beforeDrop() {
    if (app.draggedComponent instanceof InputCheckbox) {
      const holder = new CheckboxHolder;
      holder.initialize();
      holder.removeCheckbox();
      wrapInAutomaticElement(holder, holder.children[0]);
      return;
    }
    if (app.draggedComponent instanceof InputRadio) {
      const holder = new RadioHolder;
      holder.initialize();
      holder.removeCheckbox();
      wrapInAutomaticElement(holder, holder.children[0]);
      return;
    }
  }

  update() {
    delete this.attributes.action;
    delete this.attributes.method;
    delete this.attributes.target;
    delete this.attributes.enctype;
    this.cssClasses.system = '';

    if (this.parent instanceof NavBar) {
      this.cssClasses.system = 'navbar-form';
    } else if (this.properties.type) {
      this.cssClasses.system = this.properties.type;
    }

    if (this.properties.action) {
      this.attributes.action = this.properties.action;
    }

    if (this.properties.method) {
      this.attributes.method = this.properties.method;
    }

    if (this.properties.target) {
      this.attributes.target = this.properties.target;
    }

    if (this.properties.enctype) {
      this.attributes.enctype = this.properties.enctype;
    }

    return super.update();
  }
}

Form.possibleTypes = [
  { label: 'Default', value: '' },
  { label: 'Inline', value: 'form-inline' },
  { label: 'Horizontal', value: 'form-horizontal' }
];

Form.possibleMethods = [
  { label: 'Default', value: '' },
  { label: 'Get', value: 'get' },
  { label: 'Post', value: 'post' }
];

Form.possibleTargets = [
  { label: 'Default', value: '' },
  { label: 'Self', value: '_self' },
  { label: 'Blank', value: '_blank' },
  { label: 'Parent', value: '_parent' },
  { label: 'Top', value: '_top' }
];

Form.possibleEnctypes = [
  { label: 'Default', value: '' },
  { label: 'URL Encoded', value: 'application/x-www-form-urlencoded' },
  { label: 'Multipart', value: 'multipart/form-data' },
  { label: 'Plain', value: 'text/plain' }
];

Form.suggestedComponents = ['FormGroup'];

export default Form;
