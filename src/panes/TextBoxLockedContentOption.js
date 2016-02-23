import OptionItem from './OptionItem';
import saveRestoreCaret from '../helpers/saveRestoreCaretPosition';

class TextBoxLockedContentOption extends OptionItem {
  constructor(options) {
    super(options);
    this.element = $(
      `<label><span>${this._options.label}</span>` +
      '<div class="tb-locked">' +
      '<i><u class="material-icon lock" title="System Styles">lock_outline</u></i> ' +
      '<b contenteditable></b>' +
      '</div></label>'
    );
    if (options.lockedContent) {
      this.element.find('i').append(document.createTextNode(options.lockedContent));
    } else {
      this.element.find('i').remove();
    }
    this.b = this.element.find('b');
  }

  bindEventListeners() {
    this.element.off('click').on('click', this.labelClick.bind(this));
    this.b.off('input').on('input', this.input.bind(this));
    this.b.off('keydown').on('keydown', this.keydownHandler.bind(this));
  }

  labelClick(e) {
    if (document.activeElement !== this.b[0]) {
      this.b[0].focus();
      e.preventDefault();
    }
  }

  input() {
    const pos = saveRestoreCaret.save();
    // const oldLength = this.b.text().length;
    this.b.text(this.b.text());
    saveRestoreCaret.restore(this.b[0].firstChild, pos);
    this.changeHandler();
  }

  val() {
    return this.b.text();
  }

  update() {
    super.update();

    this.element.find('b').text(this.getValue());
    this.bindEventListeners();
    return this.element;
  }
}

export default TextBoxLockedContentOption;
