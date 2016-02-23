import ResourceCollection from './ResourceCollection';
import Page from '../base/Page';

class PageResourceCollection extends ResourceCollection {
  constructor() {
    super();
  }

  create(name, data, context) {
    const p = new Page;

    if (data) {
      p.unserialize(data);
    } else {
      p.initialize();
    }

    if (context) {
      p.setContext(context);
    }
    return p;
  }

  unserialize(arr, context) {
    this.items = arr.map(r => this.create(null, r, context));
    this.sort();
  }
}

export default PageResourceCollection;
