import Dialog from './Dialog';

export default class AlertDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.message = elem.find('.message');
    this.title = elem.find('h5');
    elem.find('.button.ok').on('click', this.close.bind(this));
  }

  open(options) {
    this.message.text(options.message);
    this.title.text(options.title);

    super.open(options);
  }
}
