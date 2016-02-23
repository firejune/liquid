import color from 'onecolor';
// import positionElementNextToPoint from '../helpers/positionElementNextToPoint';
import colorLibrary from '../config/color-library';

class ColorPicker {
  constructor(element) {
    this.element = element;
    this.originalColor = null;
    this.color = {};
    this.format = 'hex';
    this.activeTab = 'select';
    this.selectTab = this.element.find('.tab-target.select');
    this.swatchTab = this.element.find('.tab-target.swatch');
    this.active = false;
    this.mouseOverColorPicker = false;
    this.lastClickTime = null;
    this.lastClickColor = null;
    this.windowColorAtMouse = null;
    this.windowColorSelectionActive = false;
    this.screenshotCanvas = document.createElement('canvas');
    this.screenshotLoaded = false;
    this.cursorCanvas = document.createElement('canvas');
    this.cursorCanvas.width = 60;
    this.cursorCanvas.height = 60;
    this.cursorCanvasCtx = this.cursorCanvas.getContext('2d');
    this.overlay = $('#color-picker-overlay');
    this.overlayIsVisible = false;
    this.windowColorSelectionElement = $('#window-color-selection');
    this.hueSlider = this.element.find('.hue');
    this.alphaSlider = this.element.find('.alpha');
    this.formatDropdown = this.element.find('.format');
    this.valueField = this.element.find('.value');
    this.newColor = this.element.find('.new-color');
    this.oldColor = this.element.find('.old-color');
    this.favoriteButton = this.element.find('.favorite');
    this.gradientElement = this.element.find('.gradient');
    this.colorSelection = this.element.find('.selection');

    this.hueSlider.on('input', this.hueSlide.bind(this));
    this.alphaSlider.on('input', this.alphaSlide.bind(this));
    this.formatDropdown.on('change', this.formatChange.bind(this));
    this.valueField.on('change', this.fieldChange.bind(this));

    this.element.on('click', '.tab', this.tabClick.bind(this));
    this.element.on('click', '.favorite', this.favoriteClick.bind(this));
    this.element.on('click', '.picker', this.pickerClick.bind(this));
    this.element.on('click', '.old-color', this.originalColorClick.bind(this));
    this.element.on('click', '.select-button', this.selectClick.bind(this));
    this.element.on('click', '.cancel-button', this.cancelClick.bind(this));
    this.element.on('click', '.color', this.colorClick.bind(this));
    this.element.on('mousedown', '.gradient', this.gradientMousedown.bind(this));
    this.element.on('mousemove', '.gradient', this.gradientMousemove.bind(this));
    this.element.on('mouseenter', this.mouseEnter.bind(this));
    this.element.on('mouseleave', this.mouseLeave.bind(this));

    app.on('mouseup', this.mouseUp.bind(this));
    app.on('mousedown', this.mouseDown.bind(this));
    app.on('mousemove', this.mouseMove.bind(this));
    app.on('context-closed context-changed', this.discard.bind(this));
    app.on('component-blurred pane-resize resize', this.windowChanged.bind(this));
    app.on('screenshot-ready', this.screenshotReady.bind(this));

    app.on('keydown', e => {
      if (!this.active) return;

      // ESC
      if (e.which === 27) {
        if (this.windowColorSelectionActive) {
          this.deactivateWindowColorSelection();
        } else {
          this.discard();
        }
        return false;
      }

      // Enter
      if (e.which === 13) {
        if (this.windowColorSelectionActive) {
          this.selectWindowColor();
          this.deactivateWindowColorSelection();
        } else {
          this.select();
        }
        return false;
      }
    }, -10);
  }

  /**
   * @param e
   */
  mouseUp() {
    this.mouseIsDown = false;

    if (this.windowColorSelectionActive) {
      this.windowColorSelectionClick();
    }
  }

  /**
   * @param e
   */
  mouseDown() {
    if (this.active && !this.mouseOverColorPicker) {
      if (this.windowColorSelectionActive) return;
      this.select();
    }
  }

  mouseEnter() {
    this.mouseOverColorPicker = true;
  }

  mouseLeave() {
    this.mouseOverColorPicker = false;
  }

  mouseMove() {
    if (this.windowColorSelectionActive) {
      this.windowColorSelectionMousemove();
    }
  }

  tabClick(e) {
    const clickedTab = e.target.dataset.tab;
    if (clickedTab === this.activeTab) {
      return;
    }

    this.activeTab = clickedTab;
    if (clickedTab === 'select') {
      this.selectTab.addClass('active');
      this.swatchTab.removeClass('active');
    } else {
      this.selectTab.removeClass('active');
      this.swatchTab.addClass('active');
    }

    this.element.find('.tab').removeClass('active');
    e.target.classList.add('active');
    this.update();
  }

  registerColorClick() {
    if (this.lastClickTime && Date.now() - this.lastClickTime < 300
      && this.lastClickColor === this.color.cssa()) {
      this.select();
      return;
    }
    this.lastClickTime = Date.now();
    this.lastClickColor = this.color.cssa();
  }

  colorClick(e) {
    const col = e.currentTarget.firstChild.style.backgroundColor;
    this.color = color(col);
    if (this.color.alpha() < 1) {
      this.format = 'rgb';
    } else {
      this.format = 'hex';
    }
    this.update();
    this.scheduleColorNotification();
    this.registerColorClick();
  }

  /**
   * @param e
   */
  hueSlide() {
    this.color = this.color.hue(this.hueSlider.val() / 100);
    this.scheduleColorNotification();
    this.update();
  }

  /**
   * @param e
   */
  alphaSlide() {
    this.color = this.color.alpha(this.alphaSlider.val() / 100);
    if (this.alphaSlider.val() < 100) {
      this.format = 'rgb';
    } else {
      this.format = 'hex';
    }
    this.scheduleColorNotification();
    this.update();
  }

  /**
   * @param e
   */
  formatChange() {
    this.format = this.formatDropdown.val();
    if (this.format === 'hex') {
      this.color = this.color.alpha(1);
    }
    this.scheduleColorNotification();
    this.update();
  }

  /**
   * @param e
   */
  fieldChange() {
    const col = color(this.valueField.val());
    if (col === false) return;
    this.color = col;
    this.scheduleColorNotification();
    this.update();
  }

  /**
   * @param e
   */
  favoriteClick() {
    app.toggleFavoriteColor(this.color.cssa());
    this.update();
  }

  /**
   * @param e
   */
  pickerClick() {
    this.activateWindowColorSelection();
    setTimeout(() => {
      this.updateScreenshot();
    }, 50);
  }

  /**
   * @param e
   */
  originalColorClick() {
    this.color = color(this.originalColor);
    this.scheduleColorNotification();
    this.update();
  }

  /**
   * @param e
   */
  selectClick() {
    this.select();
  }

  /**
   * @param e
   */
  cancelClick() {
    this.discard();
  }

  gradientMousedown(e) {
    this.mouseIsDown = true;
    this.color = this.gradientColorAtCoordinates(e.offsetX, e.offsetY);
    this.scheduleColorNotification();
    this.update();
    this.registerColorClick();
  }

  gradientMousemove(e) {
    if (!this.mouseIsDown) return;
    this.color = this.gradientColorAtCoordinates(e.offsetX, e.offsetY);
    this.scheduleColorNotification();
    this.update();
  }

  gradientColorAtCoordinates(x, y) {
    return this.color
      .saturation(x / this.gradientElement[0].offsetWidth)
      .value(1 - y / this.gradientElement[0].offsetHeight);
  }

  select() {
    if (this.options) {
      this.options.onSelect(this.getNewColorAsCSSString());
    }
    this.close();
  }

  discard() {
    if (this.options) {
      this.options.onCancel();
    }
    this.close();
  }

  open(options) {
    this.options = options;
    this.element.show();

    // const arrow = positionElementNextToPoint(this.element[0], options.point);
    // if (arrow) {}

    this.originalColor = color(options.color);
    this.color = color(options.color);

    if (options.color.trim().charAt(0) === '#') {
      this.format = 'hex';
    } else {
      this.format = 'rgb';
    }

    this.update();
    this.active = true;
    this.mouseOverColorPicker = false;
  }

  getNewColorAsCSSString() {
    if (this.format === 'rgb') {
      if (this.color.alpha() < 1) {
        return this.color.cssa();
      }
      return this.color.css();
    }
    return this.color.hex();
  }

  close() {
    if (this.windowColorSelectionActive) {
      this.deactivateWindowColorSelection();
    }
    if (this.active) {
      this.element.hide();
    }
    this.active = false;
    this.options = null;
  }

  hide() {
    this.element.hide();
  }

  show() {
    this.element.show();
  }

  updateSelectTab() {
    let huePos = Math.ceil(this.color.hue() * 100);
    if (huePos === 0) huePos = 100;

    this.hueSlider.val(huePos);
    this.alphaSlider.val(Math.round(this.color.alpha() * 100));
    this.colorSelection.css({
      left: `${Math.round(this.color.saturation() * 100)}%`,
      top: `${100 - Math.round(this.color.value() * 100)}%`
    });

    this.gradientElement.css('background-color', this.color.saturation(1).value(1).hex());
    this.newColor.css('background-color', this.color.hex());
    this.oldColor.css('background-color', this.originalColor.hex());
  }

  renderSwatchPage(colors) {
    let span;
    let i;
    let focus;

    const fragment = document.createDocumentFragment();
    const currentColorAsRGBA = this.color.cssa();

    for (const col of colors) {
      span = document.createElement('span');
      span.className = 'color';
      i = document.createElement('i');
      i.style.backgroundColor = col;
      span.appendChild(i);
      fragment.appendChild(span);

      if (col === currentColorAsRGBA) {
        focus = span;
        span.classList.add('selected');
      }
    }

    this.swatchTab.empty().append(fragment);

    if (focus) {
      focus.scrollIntoViewIfNeeded();
    }
  }

  updateDesignTab() {
    const colors = app.context.extractColors();
    colors.reverse();
    this.renderSwatchPage(colors);
  }

  updateFavoritesTab() {
    this.renderSwatchPage(app.favoriteColors);
  }

  updateLibraryTab() {
    this.renderSwatchPage(colorLibrary);
  }

  update() {
    switch (this.activeTab) {
      case 'select':
        this.updateSelectTab();
        break;
      case 'design':
        this.updateDesignTab();
        break;
      case 'favorites':
        this.updateFavoritesTab();
        break;
      case 'library':
        this.updateLibraryTab();
        break;
    }
    this.favoriteButton.toggleClass('active', app.isColorFavorite(this.color.cssa()));
    this.valueField.val(this.getNewColorAsCSSString().toLowerCase());
    this.formatDropdown.val(this.format);
  }

  scheduleColorNotification() {
    clearTimeout(this.colorNotificationTimeout);
    this.colorNotificationTimeout = setTimeout(this.notifyOfColorChange.bind(this), 50);
  }

  notifyOfColorChange() {
    if (this.options) {
      this.options.onChange(this.getNewColorAsCSSString());
    }
  }

  windowChanged() {
    if (!this.windowColorSelectionActive) {
      return;
    }

    clearTimeout(this.updateScreenshotTimeout);
    this.updateScreenshotTimeout = setTimeout(() => {
      this.updateScreenshot();
    }, 100);
  }

  activateWindowColorSelection() {
    if (this.windowColorSelectionActive) {
      return;
    }
    this.windowColorAtMouse = this.color;
    this.windowColorSelectionActive = true;
    this.overlay.show();
    this.overlayIsVisible = true;
    this.hide();
  }

  deactivateWindowColorSelection() {
    if (!this.windowColorSelectionActive) {
      return;
    }
    this.windowColorSelectionActive = false;
    this.windowColorAtMouse = null;
    this.overlay.hide();
    this.overlayIsVisible = false;
    this.screenshotLoaded = false;
    this.screenshotCanvas = document.createElement('canvas');
    this.overlay[0].style.cursor = '';
    this.show();
  }

  windowColorSelectionMousemove() {
    if (!this.screenshotLoaded) return;

    const data = this.screenshotCanvas.getContext('2d')
      .getImageData(app.mousePosition.x, app.mousePosition.y, 1, 1).data;

    this.windowColorAtMouse = color(Array.from(data));
    this.cursorCanvasCtx.clearRect(0, 0, 60, 60);
    this.cursorCanvasCtx.beginPath();
    this.cursorCanvasCtx.arc(30, 30, 29.5, 0, 2 * Math.PI);
    this.cursorCanvasCtx.clip();
    this.cursorCanvasCtx.imageSmoothingEnabled = false;

    let left = app.mousePosition.x - 2;
    let offsetLeft = 0;
    if (left < 0) {
      offsetLeft = -left;
      left = 0;
    }

    let top = app.mousePosition.y - 2;
    let offsetTop = 0;
    if (top < 0) {
      offsetTop = -top;
      top = 0;
    }

    this.cursorCanvasCtx
      .drawImage(this.screenshotCanvas, left + offsetLeft, top + offsetTop, 5, 5, 0, 0, 60, 60);

    this.cursorCanvasCtx.strokeStyle = '#cccccc';
    this.cursorCanvasCtx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      this.cursorCanvasCtx.beginPath();
      this.cursorCanvasCtx.moveTo(i * 12 + 0.5, 0.5);
      this.cursorCanvasCtx.lineTo(i * 12 + 0.5, 59.5);
      this.cursorCanvasCtx.stroke();
    }

    this.cursorCanvasCtx.beginPath();
    this.cursorCanvasCtx.moveTo(59.5, 0.5);
    this.cursorCanvasCtx.lineTo(59.5, 59.5);
    this.cursorCanvasCtx.stroke();

    for (let i = 0; i < 5; i++) {
      this.cursorCanvasCtx.beginPath();
      this.cursorCanvasCtx.moveTo(0.5, i * 12 + 0.5);
      this.cursorCanvasCtx.lineTo(59.5, i * 12 + 0.5);
      this.cursorCanvasCtx.stroke();
    }

    this.cursorCanvasCtx.beginPath();
    this.cursorCanvasCtx.moveTo(0.5, 59.5);
    this.cursorCanvasCtx.lineTo(59.5, 59.5);
    this.cursorCanvasCtx.stroke();
    this.cursorCanvasCtx.strokeStyle = '#ff4f4f';
    this.cursorCanvasCtx.strokeRect(24.5, 24.5, 12, 12);

    this.overlay[0].style.cursor = '';
    this.overlay[0].style.cursor = `url(${this.cursorCanvas.toDataURL()}) 31 31, default`;
  }

  windowColorSelectionClick() {
    this.selectWindowColor();
    setTimeout(() => {
      this.deactivateWindowColorSelection();
    }, 50);
  }

  selectWindowColor() {
    if (this.windowColorAtMouse) {
      this.color = this.windowColorAtMouse;
      this.update();
      this.scheduleColorNotification();
    }
  }

  updateScreenshot() {
    electron.takeScreenshot();
  }

  screenshotReady(dataURL) {
    if (!this.windowColorSelectionActive) {
      return;
    }
    this.screenshotCanvas.width = window.innerWidth;
    this.screenshotCanvas.height = window.innerHeight;

    const ctx = this.screenshotCanvas.getContext('2d');
    const img = new Image;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      this.screenshotLoaded = true;
    };
    img.src = dataURL;
  }
}

export default ColorPicker;
