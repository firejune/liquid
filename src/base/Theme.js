import restoreCSSList from '../helpers/restoreCSSList';
import FontResource from '../resources/FontResource';

export default class Theme {
  constructor() {
    this.id = `${app.getToken()}_${Date.now()}`;
    this.name = '';
    this.raw = '';
    this.css = [];
    this.fonts = [];
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      raw: this.raw,
      css: this.css.map(block => block.serialize()),
      fonts: this.fonts.map(f => f.serialize())
    };
  }

  unserialize(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.raw = obj.raw;
    this.css = restoreCSSList(obj.css);
    this.fonts = obj.fonts.map(o => {
      const f = new FontResource;
      f.unserialize(o);
      return f;
    });
  }
}
