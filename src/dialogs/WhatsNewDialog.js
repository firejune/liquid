import Dialog from './Dialog';

export default class WhatsNewDialog extends Dialog {
  constructor(elem) {
    super(elem);

    elem.on('click', 'li a', e => {
      electron.openBrowserWindow(e.target.href);
    });

    this.index = 0;
    this.prev = elem.find('.arrow.previous');
    this.next = elem.find('.arrow.next');
    this.prev.on('click', this.prevClick.bind(this));
    this.next.on('click', this.nextClick.bind(this));

    elem.find('.button.ok').on('click', this.close.bind(this));
  }

  nextClick() {
    this.index++;
    this.updateView();
  }

  prevClick() {
    this.index--;
    this.updateView();
  }

  updateView() {
    const log = this.options.log[this.index];

    let msg = `What's New in Version ${log.version}`;
    if (this.options.upgraded && log.version === app.getVersion()) {
      msg = `You've Upgraded to Version ${log.version}`;
    }

    this.element.find('h5').text(msg);
    this.element.find('.date').text(log.date);
    this.element.find('ul').html(log.changes.map(c => `<li>${c}</li>`));

    this.prev.toggle(!!this.options.log[this.index - 1]);
    this.next.toggle(!!this.options.log[this.index + 1]);
  }

  open(options) {
    super.open(options);

    this.index = 0;
    for (let i = 0; i < options.log.length; i++) {
      if (options.log[i].version === app.getVersion()) {
        this.index = i;
        break;
      }
    }

    this.updateView();
  }
}
