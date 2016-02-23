// import validFilename from 'valid-filename';
import dataURLToBlob from '../helpers/dataURLToBlob';
import Resource from './Resource';

class ImageResource extends Resource {
  constructor(name, extension, data = '') {
    super(name);
    this.extension = extension;
    this.data = data;
    this._blobURL = null;
  }

  destructor() {
    if (this._blobURL) {
      this.revokeBlobURL();
      this._blobURL = null;
    }
  }

  createBlobURL() {
    return window.URL.createObjectURL(dataURLToBlob(this.data));
  }

  revokeBlobURL() {
    window.URL.revokeObjectURL(this._blobURL);
  }

  serialize() {
    const obj = super.serialize();
    obj.extension = this.extension;
    obj.data = this.data;
    return obj;
  }

  unserialize(obj) {
    super.unserialize(obj);
    this.extension = obj.extension;
    this.data = obj.data;
  }

  get blobURL() {
    if (!this._blobURL) {
      this._blobURL = this.createBlobURL();
    }
    return this._blobURL;
  }

  static isNameValid(name) {
    return Resource.isNameValid(name) && /\S+\.(?:png|jpe?g|gif|svg)$/i.test(name);
  }
}

export default ImageResource;
