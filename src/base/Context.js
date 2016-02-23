// import Point from './Point';
// import Body from '../components/Body';
import Canvas from './Canvas';
import History from './History';
import PageResourceCollection from '../resources/PageResourceCollection';
import ImageResourceCollection from '../resources/ImageResourceCollection';
import FontResourceCollection from '../resources/FontResourceCollection';
import CSSResourceCollection from '../resources/CSSResourceCollection';
import JSResourceCollection from '../resources/JSResourceCollection';
import restoreCSSList from '../helpers/restoreCSSList';
import EditorGroup from '../editors/EditorGroup';
import HTMLTree from '../editors/HTMLTree';
import ActiveStyles from '../editors/ActiveStyles';
// import CSSEditor from '../editors/CSSEditor';

export default class Context {
  constructor(name, path, theme = 'default') {
    this.name = name;
    this.path = path;
    this.themeCSS = [];
    this.pages = new PageResourceCollection;
    this.page = null;
    this.history = new History(100, this);
    this.historyStackID = 0;
    this.blockToCSSCache = new WeakMap;
    this.leftEditorGroup = new EditorGroup;
    this.rightEditorGroup = new EditorGroup;
    this.leftEditorGroup.add(new HTMLTree);
    this.rightEditorGroup.add(new ActiveStyles);
    this.canvasDimensions = {
      zoom: 1,
      width: Canvas.sizes.md,
      height: 600
    };

    if (window && window.innerWidth < 1550) {
      this.canvasDimensions.zoom = 0.75;
    }

    if (window && window.innerWidth < 1330) {
      this.canvasDimensions.zoom = 0.5;
    }

    this.uiState = {
      visualizeGrid: true,
      assetCategories: {}
    };

    this.assets = {
      images: new ImageResourceCollection,
      fonts: new FontResourceCollection,
      css: new CSSResourceCollection,
      js: new JSResourceCollection
    };

    this.theme = theme;
    this.assetPath = './assets/embed/';
    this.lastSaveTime = null;
  }

  destructor() {
    this.assets.images.getAll().forEach(asset => asset.revokeBlobURL());
  }

  destructEditors() {
    this.leftEditorGroup.destructEditors();
    this.rightEditorGroup.destructEditors();
  }

  createCSS(prefix = 'untitled', ser = null) {
    const name = this.assets.css.generateUniqueFreeName(prefix, 'css');
    return this.assets.css.create(name, ser);
  }

  createJS(prefix = 'untitled', ser = null) {
    const name = this.assets.js.generateUniqueFreeName(prefix, 'js');
    return this.assets.js.create(name, ser);
  }

  createImage(prefix = 'untitled', extension = 'jpg', ser = null) {
    const name = this.assets.images.generateUniqueFreeName(prefix, extension);
    const img = this.assets.images.create(name);

    if (ser) {
      img.unserialize(ser);
      img.setName(name);
    }

    return img;
  }

  hasJS() {
    return this.assets.js.length > 0;
  }

  createPage(prefix = 'untitled', ser = null) {
    const name = this.pages.generateUniqueFreeName(prefix, 'html');
    const page = this.pages.create(name, ser, this);
    page.setName(name);

    return page;
  }

  setActivePage(page) {
    if (!page) {
      page = this.pages.find('index.html');
      if (!page) {
        page = this.pages.get(0);
      }
    }
    this.page = page;
  }

  extractColors() {
    const colors = [];

    for (const block of app.context.getUserCSS()) {
      for (const rule of block.rules) {
        if (!rule.isColorRelated()) continue;
        for (const col of rule.extractColors()) {
          if (colors.indexOf(col.color) === -1) {
            colors.push(col.color);
          }
        }
      }
    }

    return colors;
  }

  hasResource(resource) {
    if (this.pages.hasResource(resource)) {
      return true;
    }

    for (const col in this.assets) {
      if (this.assets[col].hasResource(resource)) return true;
    }

    return false;
  }

  findResourceForCSSBlock(block) {
    if (this.blockToCSSCache.has(block)) {
      return this.blockToCSSCache.get(block);
    }

    const css = this.assets.css.findResourceForBlock(block);
    if (css) {
      this.blockToCSSCache.set(block, css);
    }
    return css;
  }

  /**
   * @param name
   * @param options
   */
  transformImageResource(name) {
    const asset = this.assets.images.getByName(name);
    if (!asset) return false;
    return asset.blobURL;
  }

  replaceBlobURLsInString(str) {
    const blobRegex = /blob:[%\d-\.\/\w]+/g;
    return str.replace(blobRegex, match => {
      for (const img of this.assets.images.getAll()) {
        if (img._blobURL === match) return img.name;
      }

      return match;
    });
  }

  replaceUserCSSInPreviewString(str) {
    let newCSS = app.context.generateUserCSS({
      env: 'preview'
    });

    if (this.isThemeUserMade()) {
      newCSS = this.getActiveTheme().raw + newCSS;
    }

    return str.replace(/<style>[^]*<\/style>/, `<style>${newCSS}</style>`);
  }

  isThemeUserMade() {
    return app.isThemeUserMade(this.theme);
  }

  getStylesheetForActiveTheme() {
    return `${this.assetPath}bootstrap/${this.theme}/bootstrap.min.css`;
  }

  getActiveTheme() {
    return app.getThemeById(this.theme);
  }

  getThemeFonts() {
    return this.getActiveTheme().fonts;
  }

  getUserFonts() {
    return this.assets.fonts.getAll();
  }

  getFonts() {
    return this.getThemeFonts().concat(this.getUserFonts());
  }

  shouldIncludeFontAwesome() {
    return true;
  }

  generateUserCSS(opt) {
    let css = '';
    let tmp;
    const userCSS = this.getUserCSS();
    for (let i = 0; i < userCSS.length; i++) {
      tmp = userCSS[i].toString(opt);
      if (tmp) {
        css = `${css}${tmp}\n`;
      }
    }
    return this.processGeneratedCSS(css);
  }

  generateCSSForStylesheet(resource, opt) {
    let css = '';
    let tmp;
    const userCSS = resource.blocks;

    for (let i = 0; i < userCSS.length; i++) {
      tmp = userCSS[i].toString(opt);
      if (tmp) {
        css = `${css}${tmp}\n`;
      }
    }
    return this.processGeneratedCSS(css);
  }

  processGeneratedCSS(css) {
    return css.replace(/url\(['']?([^)'';}]+)['']?\)/g, (match, image) => {
      const src = this.transformImageResource(image, {
        stylesheet: true
      });

      if (src) {
        return match.replace(image, src);
      }

      return match;
    });
  }

  prepareCSSPendingChangesString(css) {
    return this.processGeneratedCSS(css);
  }

  markAsSaved(path = null) {
    this.lastSaveTime = Date.now();
    this.historyStackID = this.history.stackID;
    if (path) {
      this.path = path;
    }
  }

  isActive() {
    return app.context === this;
  }

  isSaved() {
    return this.existsOnDisk() && !this.hasUnsavedChanges();
  }

  canBeSaved() {
    return !this.isSaved();
  }

  canBeSavedAs() {
    return this.existsOnDisk();
  }

  existsOnDisk() {
    return this.lastSaveTime !== null;
  }

  hasUnsavedChanges() {
    return this.historyStackID !== this.history.stackID;
  }

  getAllCSS() {
    const arr = this.themeCSS.slice();
    for (const cssResource of this.assets.css.getAll()) {
      arr.push.apply(arr, cssResource.blocks);
    }
    return arr;
  }

  getUserCSS() {
    const arr = [];

    for (const cssResource of this.assets.css.getAll()) {
      arr.push.apply(arr, cssResource.blocks);
    }

    return arr;
  }

  /**
   * @param {function} resolve
   * @param {function} reject
   */
  loadThemeStyles() {
    return new Promise(resolve => {
      if (app.isThemeUserMade(this.theme)) {
        const theme = app.getThemeById(this.theme);
        this.themeCSS = theme.css;
        resolve(true);
      } else {
        $.getJSON(`./assets/embed/bootstrap/${this.theme}/css.json`, css => {
          this.themeCSS = restoreCSSList(css);
          resolve(true);
        });
      }
    });
  }

  usesTheme(id) {
    return this.theme === id;
  }

  serialize() {
    return {
      name: this.name,
      theme: this.theme,
      assets: {
        images: this.assets.images.serialize(),
        fonts: this.assets.fonts.serialize(),
        css: this.assets.css.serialize(),
        js: this.assets.js.serialize()
      },
      pages: this.pages.serialize()
    };
  }

  unserialize(json) {
    this.name = json.name;
    this.theme = json.theme;
    this.assets.fonts.unserialize(json.assets.fonts);
    this.assets.images.unserialize(json.assets.images);
    this.assets.css.unserialize(json.assets.css);
    this.assets.js.unserialize(json.assets.js);
    this.pages.unserialize(json.pages, this);
  }
}
