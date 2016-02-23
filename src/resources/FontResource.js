import Resource from './Resource';

class FontResource extends Resource {
  constructor(name, url) {
    super(name);
    this.url = url;
  }

  serialize() {
    const obj = super.serialize();
    obj.url = this.url;
    return obj;
  }

  unserialize(obj) {
    super.unserialize(obj);
    this.url = obj.url;
  }
}

export default FontResource;
