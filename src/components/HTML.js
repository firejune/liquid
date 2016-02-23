import ComponentWithChildren from './ComponentWithChildren';
import Component from './Component';
// import Body from './Body';
import escapeInlineStyleContent from '../helpers/escapeInlineStyleContent';

export default class HTML extends ComponentWithChildren {
  constructor() {
    super();

    this.element = $('<html>');
    this.element.html('<head> ' +
      '\n				<meta charset="utf-8" />' +
      '\n				<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
      '\n				<title></title>' +
      '\n			</head>' +
      '\n			<body>' +
      '\n			</body>'
    );
    this.attributesMask.manifest = null;
    this.fontAwesomeCSS = null;
    this.iframeCSS = null;
    this.userStylesheet = null;
    this.userPendingStylesheet = null;
    this.head = this.element.find('head');
    this.bootstrapActiveTheme = null;
    this.themeCSS = $();
    this.userFontIncludes = [];
    this.overrideBlacklist = ['/0'];

    this.fixate();
  }

  setPage(page) {
    this._page = page;
  }

  page() {
    return this._page;
  }

  canTakeChild() {
    return false;
  }

  canBeDroppedIn() {
    return false;
  }

  fillUserPendingStylesheet(css) {
    this.userPendingStylesheet.html(escapeInlineStyleContent(css));
  }

  fillUserStylesheet(css) {
    this.userStylesheet.html(escapeInlineStyleContent(css));
  }

  update() {
    const context = this.context();
    if (context.isExport) {
      this.head.append(`<link rel="stylesheet" href="${context.getStylesheetForActiveTheme()}">`);
    } else {
      if (!this.head.find('base').length) {
        this.head.prepend(`<base href="${document.baseURI}" bs-system-element bs-hidden></base>`);
      }
      if (!this.themeCSS.length || this.bootstrapActiveTheme !== context.theme) {
        this.themeCSS.remove();
        if (context.isThemeUserMade()) {
          this.themeCSS = $('<style bs-system-element bs-hidden>')
            .text(context.getActiveTheme().raw);
        } else {
          const sheet = context.getStylesheetForActiveTheme();
          this.themeCSS = $(`<link rel="stylesheet" href="${sheet}">`);
        }
        this.head.find('title').after(this.themeCSS);
        this.bootstrapActiveTheme = context.theme;
      }
    }

    outer:
    for (let i = 0; i < context.assets.fonts.length; i++) {
      const font = context.assets.fonts.get(i);
      for (let j = 0; j < this.userFontIncludes.length; j++) {
        if (this.userFontIncludes[j].font === font) {
          continue outer;
        }
        if (this.userFontIncludes[j].font.url === font.url) {
          continue outer;
        }
      }

      const tmp = $('<link rel="stylesheet">');
      tmp.attr('href', font.url);
      tmp.font = font;
      this.head.append(tmp);
      this.userFontIncludes.push(tmp);
    }

    const tmpIncludes = [];

    outer:
    for (let i = 0; i < this.userFontIncludes.length; i++) {
      for (let j = 0; j < context.assets.fonts.length; j++) {
        const font = context.assets.fonts.get(j);
        if (this.userFontIncludes[i].font === font) {
          tmpIncludes.push(this.userFontIncludes[i]);
          continue outer;
        }
      }
      this.userFontIncludes[i].remove();
    }

    this.userFontIncludes = tmpIncludes;
    if (context.isExport) {
      for (const stylesheet of context.assets.css.getAll()) {
        this.head.append(
          `<link rel="stylesheet" href="${context.assetPath}css/${stylesheet.name}">`
        );
      }
    } else {
      if (!this.userStylesheet) {
        this.userStylesheet = $('<style bs-system-element></style>');
        this.head.append(this.userStylesheet);
        this.userPendingStylesheet = $('<style bs-system-element bs-hidden></style>');
        this.head.append(this.userPendingStylesheet);
      }
      if (!this.iframeStyles) {
        this.iframeStyles = $(
          `<link rel="stylesheet" href="${context.assetPath}iframe-styles.css" ` +
          'bs-system-element bs-hidden>'
        );
        this.head.append(this.iframeStyles);
      }
    }

    if (context.shouldIncludeFontAwesome() && !this.fontAwesomeCSS) {
      this.fontAwesomeCSS = $(
        `<link rel="stylesheet" href="${context.assetPath}bootstrap/fonts/font-awesome.min.css">`
      );
      this.head.append(this.fontAwesomeCSS);
    }
    Component.prototype.startUpdate.call(this);

    const body = this.element.find('body');
    body.replaceWith(this.body.update());
    this.element.find('title').text(context.name);

    if (context.isExport) {
      const js = [];
      let tmp = document.createElement('script');
      tmp.src = `${context.assetPath}js/jquery.min.js`;
      js.push(tmp);

      tmp = document.createElement('script');
      tmp.src = `${context.assetPath}bootstrap/js/bootstrap.min.js`;
      js.push(tmp);

      for (const script of context.assets.js.getAll()) {
        tmp = document.createElement('script');
        tmp.src = `${context.assetPath}js/${script.name}`;
        js.push(tmp);
      }

      for (const j of js) {
        this.body.element.append(j);
      }
    }

    return Component.prototype.finishUpdate.call(this);
  }

  get body() {
    return this.children[0];
  }
}
