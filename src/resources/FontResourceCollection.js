import ResourceCollection from './ResourceCollection';
import FontResource from './FontResource';

class FontResourceCollection extends ResourceCollection {
  constructor() {
    super();
  }

  create(name, url) {
    return new FontResource(name, url);
  }
}

export default FontResourceCollection;
