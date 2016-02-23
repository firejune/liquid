import Dialog from './Dialog';

export default class ConfirmDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.message = elem.find('.message');
    this.title = elem.find('h5');
    this.okButton = elem.find('.button.ok');
    this.okButton.on('click', this.onOK.bind(this));
    elem.find('.button.cancel').on('click', this.close.bind(this));
  }

  open(options) {
    this.message.text(options.message);
    this.title.text(options.title);
    this.okButton.text(options.okButton);

    super.open(options);
  }

  onOK() {
    this.options.onOK();
    this.close();
  }
}
