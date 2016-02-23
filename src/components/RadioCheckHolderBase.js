import ComponentWithChildren from './ComponentWithChildren';
import FieldLabel from './FieldLabel';
import {possibleValidationStates} from './FormGroup';

class RadioCheckHolderBase extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.defineProperties([{
      id: 'disabled',
      label: 'Disabled',
      type: 'checkbox',
      value: false
    }, {
      id: 'inline',
      label: 'Inline',
      type: 'checkbox',
      value: false
    }, {
      id: 'validation',
      label: 'Validation State',
      type: 'select',
      value: '',
      options: possibleValidationStates
    }]);
    this.inlineClass = '';
    this.regularClass = '';
    this.ComponentConstructor = null;
  }

  initialize(text = 'Label') {
    const l = new FieldLabel(text);
    l.initialize();
    l.fixate();

    const elem = new this.ComponentConstructor;
    elem.initialize();
    elem.fixate();

    l.insertFirst(elem);
    this.insertFirst(l);
  }

  canTakeChild() {
    return false;
  }

  removeMainComponent() {
    if (this.children[0].children[0]
      && this.children[0].children[0].component instanceof this.ComponentConstructor) {
      return this.children[0].removeChild(this.children[0].children[0]);
    }
    return false;
  }

  update() {
    this.cssClasses.system = '';
    if (this.properties.inline) {
      const tmp = $('<span>');
      this.element.replaceWith(tmp);
      this.element = tmp;
      this.children[0].cssClasses.parent = this.inlineClass;
    } else {
      const tmp = $('<div>');
      this.element.replaceWith(tmp);
      this.element = tmp;
      this.cssClasses.system = this.regularClass;
      this.children[0].cssClasses.parent = '';
    }
    if (this.properties.disabled) {
      this.cssClasses.system += ' disabled';
    }
    if (this.properties.validation) {
      this.cssClasses.system += ` has-${this.properties.validation}`;
    }

    return super.update();
  }
}

export default RadioCheckHolderBase;
