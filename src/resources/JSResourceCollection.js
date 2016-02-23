import ResourceCollection from './ResourceCollection';
import JSResource from './JSResource';

class JSResourceCollection extends ResourceCollection {
  constructor() {
    super();
  }

  create(name, ser) {
    if (!ser) {
      return new JSResource(name);
    }

    const js = new JSResource;
    js.unserialize(ser);
    js.setName(name);
    return js;
  }
}

export default JSResourceCollection;
