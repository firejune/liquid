import OptionItem from './OptionItem';

class TextBoxOption extends OptionItem {
  constructor(options) {
    super(options);
    this.element = $(
      `<label class="option textboxoption"><span>${this._options.label}</span> ` +
      '<input type="text" value="" />' +
      '<error-tooltip-icon><tooltip></tooltip></error-tooltip-icon></label>'
    );
  }

  bindEventListeners() {
    const input = this.element.find('input');
    input.off('.tboption');
    input.on('focusout.tboption', this.focusout.bind(this));
    input.on('focusin.tboption', this.focusin.bind(this));
    input.on('keydown.tboption', this.keydownHandler.bind(this));
  }

  destructor() {
    if (this.val() !== this.getValue()) {
      try {
        this.changeHandler();
      } catch (err) {
        //
      }
    }
  }

  val(v) {
    if (v !== undefined) {
      this.element.find('input').val(v);
      return;
    }
    return this.element.find('input').val();
  }

  focusin() {
    this.hideError();
  }

  focusout() {
    try {
      this.changeHandler();
    } catch (err) {
      this.showError(err.message);
      return false;
    }
  }

  update() {
    super.update();

    this.element.find('input[type=text]').val(this.getValue());
    this.bindEventListeners();
    return this.element;
  }

  showError(message) {
    const tooltipIcon = this.element.find('error-tooltip-icon');
    const tooltip = this.element.find('tooltip');
    tooltip.text(message);
    tooltipIcon.show();
  }

  hideError() {
    this.element.find('error-tooltip-icon').hide();
  }
}

export default TextBoxOption;
