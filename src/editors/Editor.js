class Editor {
  constructor(name) {
    this.element = $('<div>');
    this._name = name;
    this.system = false;
    this.editorGroup = null;
    this.active = false;
    this.eventsBound = false;
    this.scrollTop = 0;
    this._updateTimer = null;
    this._updateFunc = this.update.bind(this);
  }

  destructor() {}

  getName() {
    return this._name;
  }

  activate() {
    this.active = true;
    if (!this.eventsBound) {
      this.bindEventListeners();
      this.eventsBound = true;
    }
  }

  deactivate() {
    this.active = false;
    this.eventsBound = false;
    this.unbindEventListeners();
  }

  saveScrollOffset() {
    this.scrollTop = this.element.find('.content')[0].scrollTop;
  }

  restoreScrollOffset() {
    this.element.find('.content')[0].scrollTop = this.scrollTop;
  }

  bindEventListeners() {
    this.element.on('mousewheel', '.content', this.saveScrollOffset.bind(this));
  }

  unbindEventListeners() {
    this.element.off('mousewheel');
  }

  isActive() {
    return this.active;
  }

  scheduleUpdate(time = 50) {
    clearTimeout(this._updateTimer);
    this._updateTimer = setTimeout(this._updateFunc, time);
    return this.element;
  }

  update() {
    return this.element;
  }
}

export default Editor;
