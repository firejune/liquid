import Dialog from './Dialog';

export default class AboutDialog extends Dialog {
  constructor(elem) {
    super(elem);
    elem.find('.button.ok').on('click', this.close.bind(this));
  }

  open(options) {
    if (options.trial) {
      this.element.find('.updates-until')
        .html(`Trial expires on: <span>${options.updatesUntil}</span>`);
    } else {
      this.element.find('.updates-until')
        .html(`Receiving updates until: <span>${options.updatesUntil}</span>`);
    }
    this.element.find('.version').text(`${options.version}${options.trial ? ' Trial' : ''}`);
    this.element.find('.computer-name').text(options.computerName.slice(0, 30));

    super.open(options);
  }
}
