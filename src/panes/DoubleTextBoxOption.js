import OptionItem from './OptionItem';

class DoubleTextBoxOption extends OptionItem {
  constructor(options) {
    super(options);
    this.element = $([
      '<div class="option doubletextboxoption">',
      '  <label>',
      '    <input type="text" class="key" />',
      '    <input type="text" class="value" />',
      '    <span class="delete">×</span>',
      '  </label>',
      '</div>'
    ].join(''));

    this.keyElement = this.element.find('.key');
    this.valueElement = this.element.find('.value');
  }

  bindEventListeners() {
    this.element.off('.dboption');
    this.element.on('keydown.dboption', 'input', this.keydownHandler.bind(this));
    this.element.on('click.dboption', '.delete', this.deleteClickHandler.bind(this));
  }

  deleteClickHandler() {
    if (this._options.onDelete) {
      this._options.onDelete(this);
    }
  }

  val() {
    return {
      key: this.keyElement.val(),
      value: this.valueElement.val()
    };
  }

  update() {
    super.update();
    this.keyElement.val(this._options.key);
    this.valueElement.val(this._options.value);
    this.bindEventListeners();
    return this.element;
  }
}

export default DoubleTextBoxOption;
