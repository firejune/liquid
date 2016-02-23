import Dialog from './Dialog';
const googleFontRegex = /https?:\/\/fonts\.googleapis\.com\/css\?family=[^"'><\s]+/;

export default class FontImportDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.importButton = elem.find('.button.import');
    this.importButton.on('click', this.onImport.bind(this));
    this.urlInput = elem.find('input');
    this.urlInput.on('input', this.urlInputChanged.bind(this));
    this.working = false;
    elem.find('.button.cancel').on('click', this.close.bind(this));
  }

  /**
   * @param e
   */
  urlInputChanged() {
    this.importButton.toggleClass('disable', !googleFontRegex.test(this.urlInput[0].value));
  }

  open(options) {
    this.stopWorking();
    this.urlInput.val('');
    this.importButton.addClass('disable');
    super.open(options);
    this.urlInput.focus();
  }

  startWorking() {
    this.working = true;
    this.importButton.text('Working');
  }

  stopWorking() {
    this.working = false;
    this.importButton.text('Import');
  }

  isWorking() {
    return this.working;
  }

  onImport() {
    if (this.isWorking()) {
      return;
    }
    this.startWorking();

    const url = this.urlInput.val().match(googleFontRegex);
    if (!url.length) return;

    $.get(url[0]).done((text) => {
      const multiRegex = /font-family\:['" ]*([^'"\;\}]+)/g;
      const singleRegex = /font-family\:['" ]*([^'"\;\}]+)/;
      const matches = text.match(multiRegex);
      const detectedFonts = [];

      let name;
      const fontSet = new Set;

      for (const m of matches) {
        name = m.match(singleRegex)[1].trim();
        if (!name || !name.length) continue;
        if (fontSet.has(name)) continue;
        fontSet.add(name);
        detectedFonts.push(app.context.assets.fonts.create(name, url[0]));
      }

      this.options.onSave(detectedFonts);
      this.close();
    }).always(() => {
      this.stopWorking();
    });
  }
}
