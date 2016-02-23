import restoreComponentTree from '../helpers/restoreComponentTree';
import restoreCSSList from '../helpers/restoreCSSList';
import clone from 'clone';
import CSSResource from '../resources/CSSResource';

export default class Package {
  constructor() {
    this.id = `${app.getToken()}_${Date.now()}`;
    this.name = '';
    this.version = Date.now();
    this.css = [];
    this.fonts = [];
    this.images = [];
    this.components = {};
  }

  createCSS() {
    return restoreCSSList(this.css, {
      packageID: this.id
    });
  }

  createTree() {
    return restoreComponentTree(this.components);
  }

  createImages() {
    return this.images;
  }

  createFonts() {
    return this.fonts;
  }

  addResourcesToContextOperation(context) {
    const images = this.createImages();

    let modifyImages = false;
    let modifyFonts = false;

    let oldImages;
    let newImages;

    if (images.length) {
      oldImages = context.assets.images.getAll();
      newImages = oldImages.slice();
      modifyImages = true;

      outer:
      for (const img of images) {
        const image = context.assets.images.create(img.name, img.extension, img.data);
        for (let i = 0; i < newImages.length; i++) {
          if (newImages[i].nameEquals(image.name)) {
            newImages[i].destructor();
            newImages[i] = image;
            continue outer;
          }
        }
        newImages.push(image);
      }
    }

    const fonts = this.createFonts();
    let oldFonts;
    let newFonts;

    if (fonts.length) {
      oldFonts = context.assets.fonts.getAll();
      newFonts = oldFonts.slice();

      for (const fnt of fonts) {
        if (!context.assets.fonts.has(fnt.name)) {
          newFonts.push(context.assets.fonts.create(fnt.name, fnt.url));
          modifyFonts = true;
        }
      }
    }

    const insertCSS = [];
    for (const block of this.createCSS()) {
      if (context.assets.css.hasCSSBlock(block)) continue;
      insertCSS.push(block);
    }

    let cleanName = this.name.trim().replace(/\s+/g, '-').replace(/[^\w\d-]/g, '');
    if (!cleanName) cleanName = 'component';

    let cssFile = null;
    if (insertCSS.length) {
      cssFile = context.createCSS(cleanName, new CSSResource(cleanName, insertCSS).serialize());
    }

    return {
      'do': () => {
        if (modifyImages) {
          context.assets.images.set(newImages);
          context.assets.images.sort();
        }
        if (modifyFonts) {
          context.assets.fonts.set(newFonts);
          context.assets.fonts.sort();
        }
        if (cssFile) {
          context.assets.css.add(cssFile);
        }
      },
      undo: () => {
        if (modifyImages) {
          context.assets.images.set(oldImages);
        }
        if (modifyFonts) {
          context.assets.fonts.set(oldFonts);
        }
        if (cssFile) {
          context.assets.css.remove(cssFile);
        }
      }
    };
  }

  clone() {
    const c = new this.constructor;
    c.unserialize(this.serialize());
    return c;
  }

  serialize() {
    return {
      id: this.id,
      version: this.version,
      name: this.name,
      css: clone(this.css),
      fonts: clone(this.fonts),
      images: clone(this.images),
      components: clone(this.components)
    };
  }

  unserialize(json) {
    this.id = json.id;
    this.version = json.version;
    this.name = json.name;
    this.css = json.css;
    this.fonts = json.fonts;
    this.images = json.images;
    this.components = json.components;
  }
}
