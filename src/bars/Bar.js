export default class Bar {
  constructor() {
    this.element = null;
    this.visible = false;
  }

  show() {
    this.element.show();
    this.visible = true;
  }

  hide() {
    this.element.hide();
    this.visible = false;
  }

  isVisible() {
    return this.visible;
  }
}
