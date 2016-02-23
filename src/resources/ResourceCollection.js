// import Resource from './Resource';
import generateUniqueID from '../helpers/generateUniqueID';

class ResourceCollection {
  constructor(options = {}) {
    this.items = [];
    this.sorted = !!options.sorted;
  }

  create() {
    return null;
  }

  generateUniqueFreeName(prefix, extension) {
    let name = `${prefix}.${extension}`;
    if (this.has(name)) {
      name = `${prefix}-`;
      name += generateUniqueID(id => this.has(`${prefix}-${id}.${extension}`));
      name += `.${extension}`;
    }
    return name;
  }

  set(items) {
    this.items = items;
  }

  hasResource(resource) {
    return this.items.indexOf(resource) !== -1;
  }

  findIndexFor(resource) {
    return this.items.indexOf(resource);
  }

  get(index) {
    return this.items[index];
  }

  getAll() {
    return this.items.slice();
  }

  getByName(name) {
    return this.items[this.findIndex(name)];
  }

  findIndex(name) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].nameEquals(name)) return i;
    }
    return -1;
  }

  find(name) {
    const res = this.findIndex(name);
    if (res === -1) return false;
    return this.items[res];
  }

  has(name) {
    return this.findIndex(name) !== -1;
  }

  add(assets) {
    if (!Array.isArray(assets)) {
      assets = [assets];
    }
    for (let i = 0; i < assets.length; i++) {
      if (this.has(assets[i].name)) continue;
      this.items.push(assets[i]);
    }
    this.sort();
  }


  sort() {
    this.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  remove(assets) {
    if (!Array.isArray(assets)) {
      assets = [assets];
    }

    let index = -1;
    const removed = [];
    for (let i = 0; i < assets.length; i++) {
      index = this.findIndex(assets[i].name);
      if (index === -1) continue;
      removed.push(this.items[index]);
      this.items.splice(index, 1);
    }

    for (const rem of removed) {
      rem.destructor();
    }
  }

  rename(oldName, newName) {
    const items = this.items;
    const index = this.findIndex(oldName);

    if (index === -1) {
      return -1;
    }

    if (oldName === newName) {
      return -2;
    }

    if (!items[index].constructor.isNameValid(newName)) {
      return -3;
    }

    for (let i = 0; i < items.length; i++) {
      if (i === index) continue;
      if (items[i].constructor.nameEquals(items[i].name, newName)) {
        return -4;
      }
    }

    items[index].name = newName;
    this.sort();

    return 1;
  }

  serialize() {
    return this.items.map(i => i.serialize());
  }

  unserialize(arr) {
    this.items = arr.map(r => {
      const item = this.create();
      item.unserialize(r);
      return item;
    });
    this.sort();
  }

  get length() {
    return this.items.length;
  }
}

export default ResourceCollection;
