import OptionItem from './OptionItem';

class LinkOption extends OptionItem {
  constructor(options) {
    super(options);
    if (!this._options.onClick) {
      this._options.onClick = function() {};
    }
    this.element = $('<a>');
    this.element.text(this._options.text);
  }

  bindEventListeners() {
    this.element.off('click').on('click', this.click.bind(this));
  }

  click() {
    this._options.onClick();
  }

  update() {
    super.update();

    this.bindEventListeners();
    return this.element;
  }
}

export default LinkOption;
