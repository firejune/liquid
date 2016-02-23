import OptionItem from './OptionItem';

class SelectOption extends OptionItem {
  constructor(options) {
    super(options);
    this.element = $(`<label><span>${this._options.label}</span><select></select></label>`);
  }

  bindEventListeners() {
    this.element.find('select').off('change').on('change', this.changeHandler.bind(this));
  }

  val() {
    return this.element.find('select').val();
  }

  update() {
    super.update();

    const opts = this._options;
    const children = opts.options
      .map(o => `<option value="${o.value}">${o.label}</option>`)
      .join('');

    const select = this.element.find('select');
    select.empty();
    select.append(children);
    select.val(this.getValue());
    this.bindEventListeners();

    return this.element;
  }
}

export default SelectOption;
