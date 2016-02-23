import OptionItem from './OptionItem.js';
import Pane from './Pane.js';

class OptionsPane extends Pane {
  constructor(element) {
    super();
    this.element = element;
    this.contentElement = element.find('.content');
    this.children = [];
    this._updateTimeout = null;
    this.noComponentSelected = element.find('.no-selected');
    app.on('context-activated page-activated', this.pageOrContextActivated.bind(this));
    app.on('component-updated', this.componentUpdated.bind(this));
  }

  componentUpdated() {
    if (app.isInlineEditingActive()) {
      return;
    }
    this.scheduleUpdate();
  }

  pageOrContextActivated() {
    if (!app.context.page.focusedComponent) {
      this.empty();
    }
  }

  getById(id) {
    return walk(this);

    function walk(item) {
      let found = false;
      for (let i = 0; i < item.children.length; i++) {
        if (item.children[i].item.id === id) {
          found = item.children[i].item;
          break;
        }
        if (item.children[i].item.children) {
          found = walk(item.children[i].item);
          if (found) break;
        }
      }
      return found;
    }
  }

  add(obj, weight = 1) {
    if (!obj instanceof OptionItem) {
      throw new Error('You should pass an OptionItem to this function.');
    }

    let index = this.children.length;
    for (let i = 0; i < this.children.length; i++) {
      if (weight < this.children[i].weight) {
        index = i;
        break;
      }
    }

    this.children.splice(index, 0, {
      item: obj,
      weight
    });

    this.scheduleUpdate();
  }

  empty() {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].item.destructor) {
        this.children[i].item.destructor();
      }
    }
    this.children = [];
    this.scheduleUpdate();
  }

  update() {
    const activeElement = document.activeElement;
    let toRestoreFocus = -1;
    if (activeElement.closest('#options-pane') !== null && activeElement.nodeName === 'INPUT') {
      toRestoreFocus = $('#options-pane input').index(activeElement);
    }

    this.contentElement.empty().hide();

    const breadcrumbHolder = this.element.find('.breadcrumb-holder');
    breadcrumbHolder.empty().hide();
    if (this.children.length > 0) {
      breadcrumbHolder.html(this.children[0].item.update()).show();
      this.contentElement.append(this.children.slice(1).map(c => c.item.update())).show();
      this.noComponentSelected.hide();
    } else {
      this.noComponentSelected.show();
    }

    if (toRestoreFocus > -1) {
      $('#options-pane input').eq(toRestoreFocus).focus();
    }

    return this.element;
  }
}

export default OptionsPane;
