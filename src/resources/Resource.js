import validFilename from 'valid-filename';

class Resource {
  constructor(name) {
    this.name = name;
    this.extension = '';
  }

  setName(name) {
    this.name = name;
  }

  createEditor() {
    return null;
  }

  getNameWithoutExtension() {
    if (!this.extension) return this.name;
    return this.name.slice(0, -(this.extension.length + 1));
  }

  applyExtensionToName(name) {
    if (!this.extension) return name;
    return `${name}.${this.extension}`;
  }

  nameEquals(name) {
    return Resource.nameEquals(this.name, name);
  }

  normalizeName() {
    return Resource.normalizeName(this.name);
  }

  destructor() {}

  serialize() {
    return {
      name: this.name
    };
  }

  unserialize(obj) {
    this.name = obj.name;
  }

  static normalizeName(name) {
    return name.toLowerCase();
  }

  static isNameValid(name) {
    return name.length >= 1 && validFilename(name) && name[0] !== '.';
  }

  static nameEquals(left, right) {
    return Resource.normalizeName(left) === Resource.normalizeName(right);
  }
}

export default Resource;
