import Dialog from './Dialog';

export default class PreviewDialog extends Dialog {
  constructor(elem) {
    super(elem);

    this.previewCheckbox = elem.find('.preview-checkbox');
    this.previewCheckbox.on('change', this.togglePreview.bind(this));

    elem.find('.button.ok').on('click', this.onOK.bind(this));
    elem.on('click', '.browser-button', this.clickBrowserButton.bind(this));
    elem.on('click', '.ip input', e => e.target.select());

    app.on('preview-status-change', this.update.bind(this));
  }

  clickBrowserButton(e) {
    electron.openBrowserWindow(
      this.createURLForIP(electron.getIPAddresses()[e.target.dataset.index])
    );
  }

  createURLForIP(ip) {
    return `http://${ip}:${electron.previewPort}/`;
  }

  togglePreview() {
    app.togglePreview();
    this.previewCheckbox.prop('disabled', true);
  }

  onOK() {
    this.close();
  }

  update() {
    this.element.find('.ip-address-list').hide();
    if (app.settings.previewEnabled) {
      const ips = electron.getIPAddresses();
      const build = [];
      for (let i = 0; i < ips.length; i++) {
        build.push('<div class="ip">' +
          `					<input type="text" value="${this.createURLForIP(ips[i])}" readonly />` +
          `					<a class="button browser-button" data-index="${i}">Open in Browser</a>` +
          '				</div>'
        );
      }
      this.element.find('.ip-address-list').html(build).show();
    }

    this.previewCheckbox.prop('checked', app.settings.previewEnabled).prop('disabled', false);
    this.element.find('.checkbox b').text(app.settings.previewEnabled ? 'Enabled' : 'Disabled');
  }
}
