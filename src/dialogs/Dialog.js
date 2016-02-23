import Point from '../base/Point';

class Dialog {
  constructor(elem) {
    this.element = elem;
    this.background = elem.closest('#dialogs').find('.dialog-background');
    this.options = {};
    this.element.find('.close').on('click', this.close.bind(this));
    this.element.on('mousedown', this.dialogMousedown.bind(this));
    app.on('resize', this.appResized.bind(this));
    this._updateFunc = this.update.bind(this);
    this.startPosition = null;
    this.lastPosition = null;
    this.currentOffset = new Point;
  }

  appResized() {
    this.element[0].style.transform = '';
    this.currentOffset = new Point;
  }

  dialogMousedown(e) {
    if (!this.options.canBeMoved) return;

    const target = $(e.target);
    if (!target.is(this.element) && !target.is('h5')) return;
    this.startPosition = app.mousePosition.clone().subtract(this.currentOffset);
    this.lastPosition = app.mousePosition.clone();
    app.on('mousemove.dialog-listener', this.dialogMousemove.bind(this));
    app.on('mouseup.dialog-listener', this.dialogMouseup.bind(this));
  }

  dialogMousemove() {
    if (app.mousePosition.x < 0
      || app.mousePosition.x > window.innerWidth
      || app.mousePosition.y < 0
      || app.mousePosition.y > window.innerHeight) {
      return;
    }

    const rect = this.element[0].getBoundingClientRect();
    if (rect.right > window.innerWidth - 20 && app.mousePosition.x > this.lastPosition.x) {
      return;
    }
    if (rect.bottom > window.innerHeight - 20 && app.mousePosition.y > this.lastPosition.y) {
      return;
    }
    if (rect.left < 20 && app.mousePosition.x < this.lastPosition.x) {
      return;
    }
    if (rect.top < 20 && app.mousePosition.y < this.lastPosition.y) {
      return;
    }
    this.currentOffset = app.mousePosition.clone().subtract(this.startPosition);
    this.element[0].style.transform =
      `translate3D(${this.currentOffset.x}px,${this.currentOffset.y}px, 0)`;

    this.lastPosition = app.mousePosition.clone();
  }

  dialogMouseup() {
    this.startPosition = null;
    this.lastPosition = null;
    app.off('.dialog-listener');
  }

  open(options = {}) {
    if (Dialog.stack.length && Dialog.stack[Dialog.stack.length - 1] instanceof this.constructor) {
      return;
    }
    this.options = Object.assign({
      showBackground: true,
      canBeMoved: false
    }, options);
    this.show(true);
    if (Dialog.stack.length) {
      Dialog.stack[Dialog.stack.length - 1].hide(false);
    }
    Dialog.stack.push(this);
  }

  close() {
    Dialog.stack.pop();
    if (Dialog.stack.length) {
      this.hide(false);
      Dialog.stack[Dialog.stack.length - 1].show();
    } else {
      this.hide();
      this.background.off('click');
      this.background.fadeOut('fast');
    }
    this.options.onClose && this.options.onClose();
    setTimeout(() => this.afterClose(), 300);
  }

  hide(animate = true) {
    if (animate) {
      this.element.fadeOut('fast');
    } else {
      this.element.hide();
    }
  }

  isVisible() {
    return this.element.is(':visible');
  }

  show(animate = true) {
    if (animate) {
      this.element.fadeIn('fast');
    } else {
      this.element.show();
    }
    if (this.options.showBackground) {
      this.background.fadeIn('fast');
    } else {
      this.background.hide();
      this.element.addClass('no-background');
    }
    this.update();
  }

  afterClose() {}

  update() {}

  scheduleUpdate(delay = 20) {
    clearTimeout(this._updateTimer);
    this._updateTimer = setTimeout(this._updateFunc, delay);
  }

  static isDialogShown() {
    return !!this.stack.length;
  }

  static getShownDialog() {
    return this.stack[this.stack.length - 1];
  }
}

Dialog.stack = [];

export default Dialog;
