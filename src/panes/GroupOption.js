import OptionItem from './OptionItem';

class GroupOption extends OptionItem {
  constructor(options) {
    super(options);

    this.label = options.label;
    this.element = $('<div class="option-group"><p class="option-group-label">' +
                     '<span class="title"></span><span class="collapse"></span></p>' +
                     '<div class="content"></div></div>');

    this.content = this.element.find('.content');
    if (options.id) {
      this.element.addClass(options.id);
      if (!app.optionsPaneCollapsedState.has(options.id)) {
        app.optionsPaneCollapsedState.set(options.id, options.collapsed || false);
      }
    }
    this.children = [];

    if (Array.isArray(options.children)) {
      for (let i = 0; i < options.children.length; i++) {
        this.add(options.children[i]);
      }
    }
  }

  bindEventListeners() {
    this.element.off('click').on('click', '.option-group-label', this.toggleCollapse.bind(this));
  }

  toggleCollapse() {
    this.element.toggleClass('collapsed');
    if (this._options.id) {
      app.optionsPaneCollapsedState.set(this._options.id, this.element.hasClass('collapsed'));
    }
  }

  destructor() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].item.destructor && this.children[i].item.destructor();
    }
  }

  add(child, weight = 1) {
    let index = this.children.length;

    for (let i = 0; i < this.children.length; i++) {
      if (weight < this.children[i].weight) {
        index = i;
        break;
      }
    }

    this.children.splice(index, 0, {
      item: child,
      weight
    });
  }

  empty() {
    this.children = [];
    this.content.empty();
  }

  update() {
    super.update();

    this.content.empty();
    this.element.find('.title').text(this.label);

    const build = [];
    let hasVisibleChildren = false;

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].item === '') {
        build.push($('<div class="spacer">'));
        continue;
      }
      if (this.children[i].item === '-') {
        build.push($('<div class="line">'));
        continue;
      }
      build.push(this.children[i].item.update());
      if (this.children[i].item.isVisible()) {
        hasVisibleChildren = true;
      }
    }

    this.content.append(build);
    this.element.toggleClass('no-label', !this.label);
    this.element.toggleClass('collapsed', !!app.optionsPaneCollapsedState.get(this._options.id));
    this.element.toggle(hasVisibleChildren);
    this.bindEventListeners();

    return this.element;
  }
}

export default GroupOption;
