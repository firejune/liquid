import Dialog from './Dialog';

export default class PurchaseDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.message = elem.find('.message');

    elem.find('.button.purchase').on('click', this.purchaseClick.bind(this));
    elem.find('.button.feedback').on('click', this.feedbackClick.bind(this));
    elem.find('.button.cancel').on('click', this.close.bind(this));
  }

  purchaseClick() {
    electron.openBrowserWindow('http://payclonestudio.io/#purchase');
  }

  feedbackClick() {
    electron.openBrowserWindow('http://payclonestudio.io/contact-us');
  }

  open(options) {
    this.element.find('.days-remaining').text(options.daysRemaining);
    super.open(options);
  }
}
