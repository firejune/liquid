import _findInTree from '../helpers/findInTree';
import _findInTreeCallback from '../helpers/findInTreeCallback';
import restoreComponentTree from '../helpers/restoreComponentTree';
import Resource from '../resources/Resource';
import HTML from '../components/HTML';
import Body from '../components/Body';

export default class Page extends Resource {
  constructor(name) {
    super(name);

    this.highlightedComponent = null;
    this.focusedComponent = null;
    this.hoveredComponent = null;
    this.focusedDOMNode = null;
    this.domToComponent = new WeakMap;
    this.hoveredInlineElement = null;
    this.inlineDOMToComponent = new WeakMap;
    this.html = null;
    this.context = null;
    this.extension = 'html';
  }

  isNameValid(name) {
    return Resource.isNameValid(name) && /\S+\.html$/.test(name);
  }

  initialize() {
    const html = new HTML;
    html.initialize();
    html.setPage(this);

    const body = new Body;
    body.initialize();
    html.insertLast(body);
    this.html = html;
  }

  isActive() {
    return app.context && app.context.isActive() && app.context.page === this;
  }

  isFocused(component) {
    return this.focusedComponent === component;
  }

  findComponentForElement(element) {
    while (element) {
      if (this.domToComponent.has(element)) {
        return this.domToComponent.get(element);
      }
      element = element.parentNode;
    }
    return null;
  }

  findInTreeCallback(cb) {
    return _findInTreeCallback(cb, this.html.body);
  }

  findInTree(what) {
    return _findInTree(what, this.html.body);
  }

  setContext(ctx) {
    this.context = ctx;
  }

  update() {
    if (this.isActive() && this.context.isActive()) {
      app.canvas.update();
    }
  }

  serialize() {
    const obj = super.serialize();
    obj.html = this.html.serialize();
    return obj;
  }

  unserialize(obj) {
    super.unserialize(obj);
    this.html = restoreComponentTree(obj.html);
    this.html.setPage(this);
  }
}
