import OptionItem from './OptionItem';

class BreadcrumbsOption extends OptionItem {
  constructor(options) {
    super(options);

    this.component = options.component;
    this.element = $('<div class="breadcrumbs-option">');
    this.list = [];
  }

  destructor() {
    app.context.previousBreadcrumbList = this.list;
  }

  bindEventListeners() {
    this.element.off('mouseup').on('mouseup', 'a', this.click.bind(this));
    this.element.off('mouseenter').on('mouseenter', 'a', this.mouseenter.bind(this));
    this.element.off('mouseleave').on('mouseleave', 'a', this.mouseleave.bind(this));
  }

  mouseenter(e) {
    const index = this.element.find('a').index(e.target);
    app.canvas.highlight(this.list[index]);
  }

  mouseleave() {
    app.canvas.removeHighlight();
  }

  click(e) {
    const index = this.element.find('a').index(e.target);

    if (e.button === 2) {
      this.list[index].showContextMenu();
      e.stopPropagation();
      return;
    }

    if (this.list[index].isFocused()) {
      return;
    }

    this.list[index].focus();
  }

  update() {
    super.update();

    let component = this.component;
    let list = [];
    while (component) {
      list.unshift(component);
      component = component.parent;
    }

    const previousList = app.context.previousBreadcrumbList || [];
    const index = previousList.indexOf(this.component);
    if (index !== -1) {
      let added = 0;
      let toAdd = 3;
      if (list.length === 1) toAdd = 4;
      for (let i = index + 1; i < previousList.length && added++ < toAdd; i++) {
        if (!previousList[i].isVisible()) {
          break;
        }
        list.push(previousList[i]);
      }
    }

    this.list = list = list.slice(-5);

    let html = '';
    for (let i = 0; i < list.length; i++) {
      html +=
        `<a${list[i] === this.component ? ' class="active"' : ''}>${list[i].getFullName()}</a>`;
    }

    this.element.html(html);
    this.bindEventListeners();

    const active = this.element.find('a.active');
    if (active.length) {
      setTimeout(() => {
        active[0].scrollIntoViewIfNeeded();
      }, 20);
    }

    return this.element;
  }
}

export default BreadcrumbsOption;
