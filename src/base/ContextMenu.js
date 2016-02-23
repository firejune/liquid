class Menu {
  constructor(x, y, options, props = {}) {
    this.x = x;
    this.y = y;
    this.options = options;
    this.hideOnMouseLeave = !!props.hideOnMouseLeave;
    this.preferLeft = !!props.preferLeft;
    this.root = null;
    this.parent = null;
    this.menu = null;
    this.menuOption = null;
    this.menuShowTimer = null;
    this.menuHideTimer = null;
    this.autoHideTimer = null;
    this.domToOption = new WeakMap;
    this.element = $('<div class="menu">');
    this.element.on('click', 'a', this.optionClick.bind(this));
    this.element.on('mouseenter', 'a', this.optionMouseenter.bind(this));
    this.element.on('mouseleave', 'a', this.optionMouseleave.bind(this));
    this.element.on('mouseleave', this.menuMouseleave.bind(this));
    this.element.on('mouseenter', this.menuMouseenter.bind(this));
  }

  setRoot(obj) {
    this.root = obj;
  }

  setParent(parent) {
    this.parent = parent;
  }

  show() {
    const zIndex = this.root.getMenuIndex();
    this.element.css('z-index', zIndex);
    this.element.html(this.renderOptions()).appendTo(this.root.element);
    if (this.x + this.element.width() > win.width() || this.preferLeft) {
      this.element.css({
        right: win.width() - this.x,
        left: 'auto'
      });
    } else {
      this.element.css({
        left: this.x,
        right: 'auto'
      });
    }
    if (this.y + this.element.height() > win.height()) {
      this.element.css({
        bottom: win.height() - this.y,
        top: 'auto'
      });
    } else {
      this.element.css({
        top: this.y,
        bottom: 'auto'
      });
    }
  }

  hide() {}

  cancelAutoHide() {
    clearTimeout(this.autoHideTimer);
  }

  cancelSubmenuHide() {
    clearTimeout(this.menuHideTimer);
  }

  hideSubmenu(menu) {
    if (!menu || menu !== this.menu) return;
    this.menu.element.remove();
    this.menu = null;
    this.menuOption = null;
    this.menuHideTimer = null;
    this.menuShowTimer = null;
  }

  showSubmenuForOption(option, node) {
    this.menuOption = option;
    const rect = node.getBoundingClientRect();
    this.menu = new Menu(rect.right - 10, rect.top + 10, option.options, {
      centerAroundPoint: true,
      hideOnMouseLeave: true
    });
    this.menu.setRoot(this.root);
    this.menu.setParent(this);
    this.menu.show();
  }

  optionMouseenter(e) {
    const node = e.target.closest('a');
    const option = this.domToOption.get(node);
    if (!option || !option.options) return;
    if (this.menu) {
      clearTimeout(this.menuHideTimer);
      this.menu.cancelAutoHide();
      if (this.menuOption !== option) {
        this.hideSubmenu(this.menu);
        this.showSubmenuForOption(option, node);
      }
    } else {
      clearTimeout(this.menuShowTimer);
      this.menuShowTimer = setTimeout(() => {
        this.showSubmenuForOption(option, node);
      }, 250);
    }
  }

  /**
   * @param e
   */
  optionMouseleave() {
    clearTimeout(this.menuShowTimer);
    if (this.menu) {
      clearTimeout(this.menuHideTimer);
      this.menuHideTimer = setTimeout(() => {
        this.hideSubmenu(this.menu);
      }, 250);
    }
  }

  optionClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const node = e.target.closest('a');
    const option = this.domToOption.get(node);
    if (!option || !option.action) return;
    this.root.hide();
    option.action();
  }

  menuMouseleave() {
    if (!this.hideOnMouseLeave) return;
    this.autoHideTimer = setTimeout(() => {
      this.parent.hideSubmenu(this);
    }, 250);
  }

  menuMouseenter() {
    if (!this.hideOnMouseLeave) return;
    this.parent.cancelSubmenuHide();
    clearTimeout(this.autoHideTimer);
  }

  renderOptions() {
    const fragment = document.createDocumentFragment();

    for (const opt of this.options) {
      if (opt.type === 'heading') {
        const heading = document.createElement('a');
        heading.className = 'heading';
        heading.textContent = opt.name;
        fragment.appendChild(heading);
        continue;
      }
      const node = document.createElement('a');
      node.textContent = opt.name;
      fragment.appendChild(node);
      if (opt.disabled) {
        node.classList.add('disabled');
      }
      this.domToOption.set(node, opt);
      if (Array.isArray(opt.options)) {
        node.classList.add('has-options');
        if (!opt.options.length) {
          node.classList.add('disabled');
        }
      }
    }

    return fragment;
  }
}

export default class ContextMenu {
  constructor(el) {
    this.element = el;
    this.visible = false;
    this.element.hide();
    this.index = 0;
    this.menu = null;
    app.on('resize blur context-changed', this.hide.bind(this));
    app.on('scroll', this.scrolled.bind(this));
  }

  scrolled(e) {
    if (!this.visible) return;
    const closest = e.target.closest('#context-menu .menu');
    if (!closest) {
      this.hide();
    }
  }

  getMenuIndex() {
    return ++this.index;
  }

  show(x, y, options, props = {}) {
    if (!options.length) return false;
    if (this.visible) {
      this.hide();
    }
    this.visible = true;
    this.element.show();
    this.menu = new Menu(x, y, options, props);
    this.menu.setRoot(this);
    this.menu.setParent(this);
    this.menu.show();
    app.trigger('context-menu-show', this);
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.element.hide().empty();
    this.menu = null;
    app.trigger('context-menu-hide', this);
  }
}
