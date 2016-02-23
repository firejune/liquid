import Dialog from './Dialog';
import smartEditableElement from '../helpers/smartEditableElement';

export default class ThemeManagerDialog extends Dialog {
  constructor(elem) {
    super(elem);

    this.listing = elem.find('.listing');
    this.importButton = elem.find('.button.import');
    this.noThemesMessage = elem.find('.no-themes');
    this.importButton.on('click', this.importClick.bind(this));

    elem.find('.button.cancel').on('click', this.close.bind(this));
    this.smartEditable = smartEditableElement({
      element: elem,
      onCommit: this.themeRename.bind(this),
      onDelete: this.themeDelete.bind(this),
      doubleClickEditing: true
    });

    app.on('bootstrap-theme-added', this.update.bind(this));
  }

  themeRename(elem, newName) {
    if (newName.trim().length < 1) {
      return false;
    }

    const item = elem.data('item');
    app.renameTheme(item, newName.trim());
    this.update();
  }

  themeDelete(elem) {
    const item = elem.data('item');
    if (app.isThemeUsedInOpenDesigns(item.id)) {
      app.alertDialog.open({
        title: 'Can\'t Delete',
        message: 'This theme is used by an open design and can\'t be deleted.'
      });
      return;
    }
    app.removeTheme(item);
    this.update();
  }

  /**
   * @param e
   */
  importClick() {
    app.importBootstrapThemeAction();
  }

  afterClose() {
    this.listing.empty();
  }

  update() {
    this.listing.empty();
    this.noThemesMessage.hide();
    if (!app.userThemes.length) {
      this.noThemesMessage.show();
      return;
    }
    this.listing.html(app.userThemes.map(buildThemeMarkup));
  }
}

function buildThemeMarkup(item) {
  const tmp = $(
    '<div class="theme-item smart-editable white-item">' +
    '\n		<span class="name"></span>' +
    '\n		<input type="text" value="" />' +
    '\n		<span class="delete">&times;</span>' +
    '\n		<span class="edit"><i class="material-icon">mode_edit</i></span>' +
    '\n		<span class="save"><i class="material-icon">check</i></span>' +
    '\n	</div>'
  );

  tmp.find('.name').text(item.name);
  tmp.data('item', item);

  return tmp;
}
