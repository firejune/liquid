import Page from '../base/Page';
import JSResource from '../resources/JSResource';
import CSSResource from '../resources/CSSResource';
import ImageResource from '../resources/ImageResource';

export default {
  validateDesign: designJSON => {
    for (const p of designJSON.pages) {
      if (!Page.isNameValid(p.name)) return false;
    }

    for (const css of designJSON.assets.css) {
      if (!CSSResource.isNameValid(css.name)) return false;
    }

    for (const js of designJSON.assets.js) {
      if (!JSResource.isNameValid(js.name)) return false;
    }

    for (const img of designJSON.assets.images) {
      if (!ImageResource.isNameValid(img.name)) return false;
    }

    return true;
  },

  validatePackage: packageJSON => {
    for (const img of packageJSON.images) {
      if (!ImageResource.isNameValid(img.name)) return false;
    }

    return true;
  }
};
