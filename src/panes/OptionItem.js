import getSmartProp from '../helpers/getSmartProp';
import setSmartProp from '../helpers/setSmartProp';

class OptionItem {
  constructor(options) {
    this._options = options;
    this.element = null;
    if (this._options.id) {
      this.id = this._options.id;
    }
    this._isCurrentlyVisible = true;
  }

  show() {
    this._isCurrentlyVisible = true;
    this.element[0].style.display = '';
  }

  hide() {
    this._isCurrentlyVisible = false;
    this.element[0].style.display = 'none';
  }

  isVisible() {
    return this._isCurrentlyVisible;
  }

  update() {
    if (getSmartProp(this._options.visible, true)) {
      this.show();
    } else {
      this.hide();
    }
  }

  getOption(prop) {
    return this._options[prop];
  }

  setOption(prop, value) {
    this._options[prop] = value;
  }

  val() {}

  keydownHandler(e) {
    // Enter
    if (e.which === 13) {
      if (this._options.onEnter) {
        this._options.onEnter();
      }
      app.focusTarget.focus();
    }

    // ESC
    if (e.which === 27) {
      if (this._options.onEscape) {
        this._options.onEscape();
      }
    }
  }

  changeHandler() {
    const oldValue = this.getValue();
    const newValue = this.val();

    if (this._options.validation) {
      this._options.validation(newValue);
    }

    this.setValue(newValue);
    if (this._options.component && oldValue !== newValue) {
      this._options.component.update();
      if (this._options.history) {
        app.context.history.add({
          name: this._options.history,
          undo: () => {
            this.setValue(oldValue);
            this._options.component.update();
          },
          redo: () => {
            this.setValue(newValue);
            this._options.component.update();
          }
        });
      }
    }

    if (this._options.onChange) {
      this._options.onChange(newValue, oldValue);
    }
  }

  getValue() {
    return getSmartProp(this._options.value);
  }

  setValue(val) {
    return setSmartProp(this._options.value, val);
  }

  get visible() {
    return this._options.visible;
  }

  set visible(val) {
    return (this._options.visible = val);
  }
}

export default OptionItem;
