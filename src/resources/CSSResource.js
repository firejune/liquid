import Resource from './Resource';
import restoreCSSList from '../helpers/restoreCSSList';
import CSSEditor from '../editors/CSSEditor';

class CSSResource extends Resource {
  constructor(name, blocks = []) {
    super(name);
    this.blocks = blocks;
    this.extension = 'css';
  }

  createEditor() {
    return new CSSEditor(this);
  }

  hasBlock(block) {
    return this.blocks.indexOf(block) !== -1;
  }

  findIndexForCSSBlock(block) {
    return this.blocks.indexOf(block);
  }

  deleteCSSBlock(block) {
    const index = this.findIndexForCSSBlock(block);
    if (index === -1) {
      return false;
    }
    this.blocks.splice(index, 1);
    return true;
  }

  addCSSBlockAtIndex(block, index) {
    this.blocks.splice(index, 0, block);
  }

  addCSSBlocksAtIndex(blocks, index) {
    this.blocks.splice.apply(this.blocks, [index, 0].concat(blocks));
  }

  serialize() {
    const obj = super.serialize();
    obj.blocks = this.blocks.map(b => b.serialize());
    return obj;
  }

  unserialize(obj) {
    super.unserialize(obj);
    this.blocks = restoreCSSList(obj.blocks);
  }

  static isNameValid(name) {
    return Resource.isNameValid(name) && /\S+\.css$/.test(name);
  }
}

export default CSSResource;
