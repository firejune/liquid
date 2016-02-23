import ResourceCollection from './ResourceCollection';
import ImageResource from './ImageResource';

class ImageResourceCollection extends ResourceCollection {
  constructor() {
    super();
  }

  create(name, extension, data) {
    return new ImageResource(name, extension, data);
  }
}

export default ImageResourceCollection;
