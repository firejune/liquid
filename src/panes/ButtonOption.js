import OptionItem from './OptionItem';

class ButtonOption extends OptionItem {
  constructor(options) {
    super(options);

    if (!this._options.onClick) {
      this._options.onClick = function() {};
    }

    this.element = $('<button class="button">');
    if (!this._options.style) {
      this._options.style = 'darkgray';
    }

    this.element.addClass(this._options.style);
    if (this._options.icon) {
      this.element.html(`<i class="material-icon">${this._options.icon}</i>`);
      if (this._options.text) {
        this.element.attr('title', this._options.text);
      }
    } else if (this._options.text) {
      this.element.text(this._options.text);
    }
  }


  bindEventListeners() {
    this.element.off('click').on('click', this.click.bind(this));
  }

  click(e) {
    this._options.onClick(e);
  }

  update() {
    super.update();
    this.bindEventListeners();

    if (this._options.layout === 'row-right') {
      return $('<label class="row-right">').append(this.element);
    }

    return this.element;
  }
}


export default ButtonOption;
