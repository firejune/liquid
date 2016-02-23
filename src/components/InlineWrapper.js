import InlineCharacter from './InlineCharacter';

export default class InlineWrapper extends InlineCharacter {
  constructor(component) {
    super();
    this.children = [];
    if (component) {
      this.children.push(component);
    }
    this.element = $('<inline-wrapper>');
  }

  hoverDrag() {
    return this.component.hoverDrag.apply(this.component, arguments);
  }

  isFocused() {
    return this.component.isFocused();
  }

  sameAs(other) {
    return super.sameAs(other) && this.component.outerHTML === other.component.outerHTML;
  }

  update() {
    this.element.empty();
    this.element.toggleClass('selected', this.selected);
    this.element.append(this.component.update.apply(this.component, arguments));
    return this.element;
  }

  updateDimensions() {
    return this.component.updateDimensions.apply(this.component, arguments);
  }

  caretHeight() {
    return this.height;
  }

  clone() {
    const n = new InlineWrapper(this.component);
    n.copyStyles(this);
    return n;
  }

  serialize() {
    return {
      'class': 'InlineWrapper',
      children: [this.children[0].serialize()]
    };
  }

  insertLast(component) {
    this.children[0] = component;
    component.parent = this.parent;
  }

  /**
   * @param obj
   */
  unserialize() {}

  get component() {
    return this.children[0];
  }

  set component(component) {
    this.children[0] = component;
  }

  get x() {
    return this.component.x;
  }

  get x2() {
    return this.component.x2;
  }

  get y() {
    return this.component.y;
  }

  get y2() {
    return this.component.y2;
  }

  get width() {
    return this.component.width;
  }

  get height() {
    return this.component.height;
  }
}
