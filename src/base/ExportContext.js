import Context from './Context';
import Icon from '../components/Icon';

class ExportContext extends Context {
  constructor(name, path) {
    super(name, path);

    this.isExport = true;
    this.assetPath = 'assets/';
    this.tempImageSrc = [];
  }

  transformImageResource(name, options = {}) {
    const asset = this.assets.images.getByName(name);
    if (!asset) return false;
    if (options.stylesheet) {
      return `../../${this.assetPath}img/${asset.name}`;
    }

    const transformedPath = `${this.assetPath}img/${asset.name}`;
    this.tempImageSrc.push(transformedPath);
    return `data:text/plain,${String(this.tempImageSrc.length - 1)}`;
  }

  generateHTML() {
    const result = [];

    for (const page of this.pages.getAll()) {
      let html = page.html.element[0].outerHTML;
      html = `<!DOCTYPE html>${html}`;
      html = html.replace(/data:text\/plain,\d+/g, match => this.tempImageSrc[match.split(',')[1]]);
      result.push({
        name: page.name,
        html
      });
    }

    return result;
  }

  shouldIncludeFontAwesome() {
    for (const p of this.pages.getAll()) {
      const icons = p.findInTree(Icon);
      for (let i = 0; i < icons.length; i++) {
        if (icons[i].usesFontAwesome()) {
          return true;
        }
      }
    }

    return false;
  }

  getStylesheetForActiveTheme() {
    return `${this.assetPath}bootstrap/css/bootstrap.min.css`;
  }
}

export default ExportContext;
