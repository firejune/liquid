import ResourceCollection from './ResourceCollection';
import CSSResource from './CSSResource';
import deepEqual from 'deep-equal';

class CSSResourceCollection extends ResourceCollection {
  constructor() {
    super();
  }

  create(name, ser) {
    if (!ser) {
      return new CSSResource(name);
    }

    const css = new CSSResource;
    css.unserialize(ser);
    css.setName(name);
    return css;
  }

  findResourceForBlock(block) {
    for (const css of this.items) {
      if (css.hasBlock(block)) {
        return css;
      }
    }
    return null;
  }

  hasCSSBlock(block) {
    for (const css of this.items) {
      for (let i = 0; i < css.blocks.length; i++) {
        if (css.blocks[i].selector === block.selector
          && css.blocks[i].mediaQuery === block.mediaQuery) {
          if (deepEqual(css.blocks[i].serialize(), block.serialize())) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

export default CSSResourceCollection;
