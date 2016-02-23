import Dialog from './Dialog';

export default class LinkDialog extends Dialog {
  constructor(elem) {
    super(elem);

    this.hrefInput = elem.find('input');
    this.targetSelect = elem.find('select');
    this.okButton = elem.find('.button.ok');
    this.removeButton = elem.find('.remove');
    this.removeButton.on('click', this.removeLink.bind(this));
    this.okButton.on('click', this.onOK.bind(this));

    elem.find('.button.cancel').on('click', this.close.bind(this));
  }

  removeLink() {
    this.options.onSave('', '');
    this.close();
  }

  open(options) {
    const href = options.link && options.link.href || '';
    const target = options.link && options.link.target || '';

    this.removeButton.toggle(!!href);
    this.hrefInput.val(href);
    this.targetSelect.val(target);

    super.open(options);

    this.hrefInput.focus();
  }

  onOK() {
    this.options.onSave(this.hrefInput.val().trim(), this.targetSelect.val());
    this.close();
  }
}
