import OptionItem from './OptionItem';

class InfoOption extends OptionItem {
  constructor(options) {
    super(options);
    this.element = $(
      '<div class="info-option">' +
      '<span class="x"><i>X</i><b></b></span>' +
      '<span class="y"><i>Y</i><b></b></span>' +
      '<span class="width"><i>W</i><b></b></span>' +
      '<span class="height"><i>H</i><b></b></span>' +
      '</div>'
    );

    this.xField = this.element.find('.x b');
    this.yField = this.element.find('.y b');
    this.wField = this.element.find('.width b');
    this.hField = this.element.find('.height b');

    app.on('component-dimensions-updated.info-option', this.componentDimensionsUpdated.bind(this));
  }

  destructor() {
    app.off('.info-option');
  }

  componentDimensionsUpdated(component) {
    if (component === this._options.component) {
      this.updateInfo();
    }
  }

  bindEventListeners() {
    this.element.off('click').on('click', 'span', this.clickB.bind(this));
  }

  clickB(e) {
    e.preventDefault();

    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(e.currentTarget.querySelector('b'));
    selection.removeAllRanges();
    selection.addRange(range);
  }

  updateInfo() {
    this.xField.text(Math.round(this._options.component.x));
    this.yField.text(Math.round(this._options.component.y));
    this.wField.text(Math.round(this._options.component.width));
    this.hField.text(Math.round(this._options.component.height));
  }

  update() {
    super.update();

    this.updateInfo();
    this.bindEventListeners();
    return this.element;
  }
}

export default InfoOption;
