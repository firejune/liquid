import Resource from './Resource';
import JSEditor from '../editors/JSEditor';

class JSResource extends Resource {
  constructor(name, value = '') {
    super(name);
    this.value = value;
    this.extension = 'js';
  }

  createEditor() {
    return new JSEditor(this);
  }

  serialize() {
    const obj = super.serialize();
    obj.value = this.value;
    return obj;
  }

  unserialize(obj) {
    super.unserialize(obj);
    this.value = obj.value;
  }

  static isNameValid(name) {
    return Resource.isNameValid(name) && /\S+\.js$/.test(name);
  }
}

export default JSResource;
