import Dialog from './Dialog';

export default class ThemeChooserDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.dialogTitleHolder = elem.find('h5');
    this.designTheme = elem.find('.design-theme');
    this.designTheme.on('change', this.onThemeSelectChange.bind(this));
    this.okButton = elem.find('.button.ok');
    elem.find('.button.manage-themes').on('click', this.manageThemes.bind(this));
    this.okButton.on('click', this.onOK.bind(this));
    elem.find('.button.cancel').on('click', this.close.bind(this));
    this.chosenTheme = '';
  }

  manageThemes() {
    app.themeManagerDialog.open();
  }

  onThemeSelectChange() {
    this.chosenTheme = this.designTheme.val();
  }

  open(options) {
    if (options.dialogTitle) {
      this.dialogTitleHolder.text(options.dialogTitle);
    }
    if (options.buttonText) {
      this.okButton.text(options.buttonText);
    }
    this.chosenTheme = options.theme;
    super.open(options);
  }

  update() {
    this.designTheme.empty();

    let tmp;
    for (const theme of app.getAllThemes()) {
      tmp = $('<option>');
      tmp.text(theme.name);
      tmp.val(theme.id);
      this.designTheme.append(tmp);
    }

    this.designTheme.val(this.chosenTheme);
  }

  onOK() {
    this.options.onSave({
      theme: this.designTheme.val()
    });
    this.close();
  }
}
