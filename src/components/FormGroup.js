import ComponentWithChildren from './ComponentWithChildren';
import FormControlFeedback from './FormControlFeedback';
import Column from './Column';
import FieldLabel from './FieldLabel';

class FormGroup extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');

    this.defineProperties({
      id: 'validation',
      label: 'Validation State',
      type: 'select',
      value: '',
      options: FormGroup.possibleValidationStates
    });
  }

  convertToHorizontalFormat() {
    if (!this.children.length) {
      return {
        undo: function undo() {},
        redo: function redo() {}
      };
    }

    const oldChildren = this.children.slice();
    this.children = [];

    let c1 = new Column;
    c1.initialize();
    c1.properties.colmd = -1;
    c1.properties.colsm = 4;

    const c2 = new Column;
    c2.initialize();
    c2.properties.colmd = -1;
    c2.properties.colsm = 8;
    if (oldChildren.length === 1 && !(oldChildren[0] instanceof FieldLabel)) {
      c1 = null;
      c2.properties.colsmOffset = 4;
    }

    const tmp = oldChildren.slice();
    const newChildren = [
      [],
      []
    ];

    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i] instanceof FieldLabel) {
        c1.insertLast(tmp[i]);
        newChildren[0].push(tmp[i]);
        tmp.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < tmp.length; i++) {
      c2.insertLast(tmp[i]);
      newChildren[1].push(tmp[i]);
    }

    c1 && this.insertLast(c1);
    this.insertLast(c2);
    return {
      undo: () => {
        this.children = [];
        oldChildren.forEach(c => this.insertLast(c));
      },
      redo: () => {
        this.children = [];
        c1 && this.insertLast(c1);
        this.insertLast(c2);
        newChildren[0].forEach(c => c1.insertLast(c));
        newChildren[1].forEach(c => c2.insertLast(c));
      }
    };
  }

  convertToRegularFormat() {
    if (!this.children.length) {
      return {
        undo: function undo() {},
        redo: function redo() {}
      };
    }

    const oldChildren = this.children.slice();
    this.children = [];

    const columnChildren = {};
    for (let i = 0; i < oldChildren.length; i++) {
      if (oldChildren[i] instanceof Column) {
        columnChildren[i] = oldChildren[i].children.slice();
        oldChildren[i].children.slice().forEach(c => this.insertLast(c));
      } else {
        this.insertLast(oldChildren[i]);
      }
    }

    const newChildren = this.children.slice();
    return {
      undo: () => {
        this.children = [];
        for (let i = 0; i < oldChildren.length; i++) {
          this.insertLast(oldChildren[i]);
          if (oldChildren[i] instanceof Column) {
            columnChildren[i].slice().forEach(c => oldChildren[i].insertLast(c));
          }
        }
      },
      redo: () => {
        this.children = [];
        for (let i = 0; i < newChildren.length; i++) {
          this.insertLast(newChildren[i]);
        }
      }
    };
  }

  canTakeChild(child) {
    return !(child instanceof FormGroup);
  }

  update() {
    this.cssClasses.system = 'form-group';

    if (this.properties.validation) {
      this.cssClasses.system += ` has-${this.properties.validation}`;
    }

    if (this.hasChild(FormControlFeedback)) {
      this.cssClasses.system += ' has-feedback';
    }

    return super.update();
  }
}

FormGroup.possibleValidationStates = [
  { label: 'None', value: '' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' }
];

FormGroup.prettyName = 'Form Group';

export let possibleValidationStates;
export default FormGroup;
