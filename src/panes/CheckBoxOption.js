import OptionItem from './OptionItem';

class CheckBoxOption extends OptionItem {
  constructor(options) {
    super(options);
    this.element = $([
      '<label class="for-checkbox">',
      `<span>${this._options.label}</span> <input type="checkbox" />`,
      '</label>'
    ].join(''));
  }

  bindEventListeners() {
    this.element.find('input').off('change').on('change', this.changeHandler.bind(this));
  }

  val() {
    return this.element.find('input').prop('checked');
  }

  update() {
    super.update();

    this.element.find('input').prop('checked', !!this.getValue());
    this.bindEventListeners();

    return this.element;
  }
}

export default CheckBoxOption;
