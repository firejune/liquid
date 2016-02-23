import Dialog from './Dialog';
import insertAtCaret from '../helpers/insertAtCaret';

export default class CharacterInputDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.textArea = elem.find('textarea');
    elem.find('.characters span').on('mousedown', this.clickChar.bind(this));
    elem.find('.button.insert').on('click', this.clickInsert.bind(this));
    elem.find('.button.clear').on('click', this.clickClear.bind(this));
    elem.find('.button.cancel').on('click', this.close.bind(this));
  }

  clickChar(e) {
    e.preventDefault();
    insertAtCaret(this.textArea[0], e.target.textContent);
  }

  /**
   * @param e
   */
  clickInsert() {
    app.context.page.focusedComponent.insertOp(this.textArea[0].value);
  }

  /**
   * @param e
   */
  clickClear() {
    this.textArea[0].value = '';
  }
}
