import deepEqual from 'deep-equal';
import Point from '../base/Point';
import Row from '../components/Row';
import Column from '../components/Column';
import dragScroll from '../helpers/dragScroll';

const canvasSizesReverse = {
  360: 'xs',
  768: 'sm',
  1024: 'md',
  1200: 'lg'
};

export default class Canvas {
  constructor(elem) {
    this.element = elem;
    this.sizer = elem.find('.sizer');
    this.iframe = elem.find('iframe');

    const iframeDoc = this.iframeDoc = $(this.iframe.prop('contentDocument'));
    // const iframeWin = this.iframeWin = $(this.iframe.prop('contentWindow'));

    this.gridContainer = this.element.find('.grid');
    this.focusRect = this.element.find('.focus-rect');
    this.domHighlight = this.element.find('.dom-highlight');
    this.line = this.element.find('.line');
    this.inlineCaret = this.element.find('.inline-caret');
    this.mousePosition = new Point;
    this.drawLine = null;
    this.html = null;
    this.iframeOffset = null;
    this._refreshTimerFunc = this.refresh.bind(this);

    app.on('mousemove', this.mousemove.bind(this));

    this.element.on('scroll',
    /**
     * @param e
     */
    () => {
      this.iframeOffset = this.iframe.offset();
    });

    iframeDoc.on('mouseleave', () => {
      if (!app.hasOpenedContexts()) return false;
      app.aboveCanvas = false;
      this.removeHighlight();
      this.hideLine();
    }).on('mouseenter', () => {
      app.aboveCanvas = true;
      this.iframeOffset = this.iframe.offset();
    });

    app.on('context-activated', () => {
      this.iframeOffset = this.iframe.offset();
    });

    iframeDoc.on('mouseover', e => {
      if (!app.hasOpenedContexts()) return false;
      if (e.target.matches('inline-character, inline-wrapper')) {
        app.context.page.hoveredInlineElement = app.context.page.inlineDOMToComponent.get(e.target);
      }

      app.context.page.hoveredComponent = app.context.page.findComponentForElement(e.target);
    });

    iframeDoc.on('mouseleave', 'inline-character, inline-wrapper',
    /**
     * @param e
     */
    () => {
      app.context.page.hoveredInlineElement = null;
      app.context.page.hoveredComponent = null;
    });

    this.element.on('mousedown', '.move-handle', e => {
      e.preventDefault();
      e.stopPropagation();

      const component = app.context.page.focusedComponent;
      if (e.button === 2) {
        component.showContextMenu();
        return;
      }

      app.dragStart({
        component,
        origin: {
          top: component.y + this.iframeOffset.top,
          left: component.x + this.iframeOffset.left,
          width: component.width,
          height: component.height
        }
      });
    });

    app.on('drag-end', this.hideLine.bind(this));

    app.on('mouseup', this.mouseup.bind(this));
    app.on('mousedown', this.mousedown.bind(this));
    app.on('context-activated page-activated', this.setUpCanvas.bind(this));
    app.on('component-updated', this.componentUpdated.bind(this));
    app.on('component-focused', this.componentFocused.bind(this));
    app.on('component-blurred', this.hideFocus.bind(this));
    app.on('context-css-changed', this.contextCSSChanged.bind(this));
    app.on('resource-changed', this.resourceChanged.bind(this));

    this.dimensions = {};
    app.on('resize pane-resize', this.updateDimensions.bind(this));
    this.element.on('mouseenter', this.updateDimensions.bind(this));

    app.on('css-pending-changes-set', this.pendingChangesSet.bind(this));
    app.on('css-pending-changes-reset context-activated page-activated component-blurred',
      this.pendingChangesReset.bind(this));
  }

  pendingChangesSet(block) {
    this.hideSystemUI();
    const css = app.context.prepareCSSPendingChangesString(block.toString());
    this.html.fillUserPendingStylesheet(css);
  }

  pendingChangesReset() {
    setTimeout(this.showSystemUI.bind(this), 20);
    this.html.fillUserPendingStylesheet('');
  }

  resourceChanged(type) {
    if (type === 'image' || type === 'font') {
      this.initialize();
    }
    if (type === 'css') {
      this.refreshCSS();
    }
  }

  updateDimensions() {
    this.dimensions = this.element[0].getBoundingClientRect();
  }

  contextCSSChanged() {
    this.refreshCSS();
  }

  componentFocused(component) {
    this.markAsFocused(component);
    this.removeDOMHighlight();
    this.scrollToNode(component.element[0]);
  }

  isNodeInVisibleCanvas(node) {
    if (node.ownerDocument !== this.iframeDoc[0]) return false;

    const rect = node.getBoundingClientRect();
    const zoom = app.context.canvasDimensions.zoom;
    const top = this.iframeOffset.top + rect.top * zoom;
    const left = this.iframeOffset.left + rect.left * zoom;
    const right = this.iframeOffset.left + rect.right * zoom;
    const bottom = this.iframeOffset.top + rect.bottom * zoom;
    const canvasRect = this.element[0].getBoundingClientRect();

    return !(top > canvasRect.bottom - 40
      || bottom < canvasRect.top + 40
      || left > canvasRect.right - 40
      || right < canvasRect.left + 40);
  }

  scrollToNode(node) {
    if (this.isNodeInVisibleCanvas(node)) return;

    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const canvasRect = this.element[0].getBoundingClientRect();
    const zoom = app.context.canvasDimensions.zoom;
    let scrollLeft;
    let scrollTop;

    if (rect.height * zoom > canvasRect.height) {
      scrollTop = 50 + rect.top * zoom - 20;
    }

    if (rect.width * zoom > canvasRect.width) {
      scrollLeft = 50 + rect.left * zoom - 20;
    }

    if (scrollTop === undefined) {
      scrollTop = 50 + rect.top * zoom - (canvasRect.height - rect.height * zoom) / 2;
    }

    if (scrollLeft === undefined) {
      scrollLeft = 50 + rect.left * zoom - (canvasRect.width - rect.width * zoom) / 2;
    }

    this.element[0].scrollTop = scrollTop;
    this.element[0].scrollLeft = scrollLeft;
  }

  componentUpdated(component) {
    component.page().domToComponent.set(component.element[0], component);
    if (!component.page().isActive()) return;

    if (app.isInlineEditingActive()) {
      component = app.context.page.focusedComponent;
      setTimeout(() => {
        if (component.haveDimensionsChanged()) {
          app.canvas.scheduleRefresh();
        }
      }, 10);

      return;
    }
    this.scheduleRefresh();
  }

  contains(DOMNode) {
    return this.iframeDoc[0].contains(DOMNode);
  }

  preloadFont(name) {
    return this.iframeDoc[0].fonts.load(`10px "${name}"`);
  }

  mouseup(e) {
    if (app.aboveCanvas) {
      const component = app.context.page.hoveredComponent;
      component && component.onMouseup(e);
    }
  }

  mousedown(e) {
    const boundingRect = this.element[0].getBoundingClientRect();
    if (app.mousePosition.y > boundingRect.bottom - 10
      || app.mousePosition.x > boundingRect.right - 10) {
      return;
    }

    if (e.target === this.element[0]) {
      if (app.context.page.focusedComponent) {
        app.context.page.focusedComponent.blur();
      }
    }

    if (!app.aboveCanvas) {
      return;
    }

    const component = app.context.page.hoveredComponent;
    if (!component) {
      return;
    }
    if (app.context.page.focusedComponent && app.context.page.focusedComponent !== component) {
      app.context.page.focusedComponent.onBlur();
    }
    component.onMousedown(e);
  }

  scheduleRefresh(timeout = 20) {
    clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(this._refreshTimerFunc, timeout);
  }

  setUpCanvas() {
    this.setHTML(app.context.page.html);
    this.initialize();
    app.canvas.resize({
      width: app.context.canvasDimensions.width,
      height: app.context.page.html.height
    });
    if (app.context.page.focusedComponent) {
      app.context.page.focusedComponent.focus();
    } else {
      this.hideFocus();
    }
    this.removeHighlight();
    this.removeDOMHighlight();
  }

  findDOMNodeWithId(id) {
    return this.html.body.element[0].querySelector(`#${id}`);
  }

  isThereDOMNodeWithID(id) {
    return this.findDOMNodeWithId(id) !== null;
  }

  generateUniqueID(prefix) {
    let i = 1;
    while (i < 1e3) {
      if (!this.isThereDOMNodeWithID(`${prefix}-${i}`)) {
        return `${prefix}-${i}`;
      }
      i++;
    }
    return '';
  }

  update() {
    return this.html.update();
  }

  mousemove() {
    if (app.isDragging) {
      dragScroll.scroll(this.element[0], this.dimensions, this.dimensions, app.mousePosition, {
        topOffset: 60,
        leftOffset: 60,
        rightOffset: 60,
        bottomOffset: 60,
        speedUpScrolling: true
      });
    } else {
      dragScroll.reset(this.element[0]);
    }

    if (!app.aboveCanvas) {
      return;
    }

    const component = app.context.page.hoveredComponent;
    if (app.isDragging) {
      this.drawLine = null;
      if (component) {
        component.hoverDrag(0);
      }
      this.renderLine();
    } else {
      if (component) {
        this.highlight(component);
      }
    }
  }

  setHTML(html) {
    this.html = html;
    this.iframeDoc.find('html').replaceWith(html.element);
    this.hideLine();
  }

  markAsDragged(component) {
    if (!component.isVisible()) {
      return;
    }
    component.element.attr('bs-dragged', 1);
  }

  markAsNotDragged(component) {
    if (!component.isVisible()) {
      return;
    }
    component.element.removeAttr('bs-dragged');
  }

  markAsFocused(component) {
    const zoom = app.context.canvasDimensions.zoom;
    if (!component.isVisible()) {
      this.focusRect.hide();
      return;
    }

    this.focusRect.css({
      top: component.y * zoom,
      left: component.x * zoom,
      width: component.width * zoom - 2,
      height: component.height * zoom - 2
    }).show();

    this.focusRect.toggleClass('inline-editing', !!component.isInlineEditingActivated);
    this.focusRect.find('.move-handle').toggle(!!component.flags.canBeMoved);
  }

  hideFocus() {
    this.focusRect.hide();
  }

  restoreFocus() {
    if (app.context.page.focusedComponent) {
      this.markAsFocused(app.context.page.focusedComponent);
    }
  }

  initialize() {
    this.update();
    this.renderCSS();
    this.scheduleRefresh();
  }

  refresh() {
    const oldHTMLHeight = this.html.height;
    this.html.updateDimensions();
    this.removeHighlight();
    this.hideLine();
    this.hideGrid();

    if (app.context.uiState.visualizeGrid) {
      this.redrawGrid();
    }

    if (oldHTMLHeight !== this.html.height) {
      this.resize({
        height: this.html.height
      });
      return;
    }

    if (app.context.page.focusedComponent) {
      this.markAsFocused(app.context.page.focusedComponent);
    }

    this.showSystemUI();
  }

  refreshCSS() {
    this.renderCSS();
    this.scheduleRefresh();
  }

  hideLine() {
    this.drawLine = null;
    this._lastDrawLine = null;
    this.line.hide();
  }

  drawHorizontalLine(x, y, width, decoration = '') {
    this.drawLine = {
      x,
      y,
      width,
      height: 1,
      decoration
    };
  }

  drawVerticalLine(x, y, height, decoration = '') {
    this.drawLine = {
      x,
      y,
      height,
      width: 1,
      decoration
    };
  }

  renderLine() {
    if (!this.drawLine) {
      if (this._lastDrawLine) {
        this.hideLine();
      }
      return;
    }
    if (deepEqual(this._lastDrawLine, this.drawLine)) {
      return;
    }

    const zoom = app.context.canvasDimensions.zoom;
    this._lastDrawLine = Object.assign({}, this.drawLine);
    this.line.show();
    this.line.width(Math.max(1, this.drawLine.width * zoom));
    this.line.height(Math.max(1, this.drawLine.height * zoom));
    this.line.css({
      top: this.drawLine.y * zoom,
      left: this.drawLine.x * zoom
    });

    this.line.attr('class', `line ${this.drawLine.decoration}`);
  }

  redrawGrid() {
    const zoom = app.context.canvasDimensions.zoom;
    const rowsAndCols = app.context.page.findInTree([Row, Column]);
    for (let i = 0; i < rowsAndCols.length; i++) {
      if (rowsAndCols[i].width * zoom - 2 < 3 || rowsAndCols[i].height * zoom - 2 < 3) {
        continue;
      }
      this.gridContainer.append($('<div class="grid-rect">').css({
        width: rowsAndCols[i].width * zoom - 2,
        height: rowsAndCols[i].height * zoom - 2,
        top: rowsAndCols[i].y * zoom,
        left: rowsAndCols[i].x * zoom
      }));
    }
  }

  hideGrid() {
    this.gridContainer.empty();
  }

  highlightDOMElement(element, options = {}) {
    options = Object.assign({
      lineOnly: false,
      displayMargin: true,
      displayHighlight: true,
      displayBorder: true,
      displayPadding: true
    }, options);
    this.removeDOMHighlight();

    const zoom = app.context.canvasDimensions.zoom;
    const styles = window.getComputedStyle(element);
    const box = element.getBoundingClientRect();
    element = $(element);

    const offset = element.offset();
    offset.left *= zoom;
    offset.top *= zoom;

    const width = box.width * zoom;
    const height = box.height * zoom;
    const marginTop = calcSize(styles.marginTop);
    const marginRight = calcSize(styles.marginRight);
    const marginBottom = calcSize(styles.marginBottom);
    const marginLeft = calcSize(styles.marginLeft);
    const paddingTop = calcSize(styles.paddingTop);
    const paddingRight = calcSize(styles.paddingRight);
    const paddingBottom = calcSize(styles.paddingBottom);
    const paddingLeft = calcSize(styles.paddingLeft);
    const borderTop = calcSize(styles.borderTop);
    const borderRight = calcSize(styles.borderRight);
    const borderBottom = calcSize(styles.borderBottom);
    const borderLeft = calcSize(styles.borderLeft);

    const drawRect = (className, x, y, w, h, top = 0, right = 0, bottom = 0, left = 0) => {
      $(`<div class="${className}">`).css({
        width: w,
        height: h,
        top: y,
        left: x,
        borderWidth: `${[top, right, bottom, left].join('px ')}px`
      }).appendTo(this.domHighlight);
    };

    if (box.width === 0 && box.height === 0) {
      return;
    }

    this.domHighlight.css({
      left: offset.left,
      top: offset.top,
      width,
      height
    }).show();

    if (options.lineOnly) {
      drawRect('highlight-line', 0, 0, width, height, 1, 1, 1, 1);
      return;
    }
    if (options.displayBorder) {
      drawRect('border', 0, 0, width, height, borderTop, borderRight, borderBottom, borderLeft);
    }
    if (options.displayPadding) {
      drawRect('padding', borderLeft, borderTop, width - (borderLeft + borderRight),
        height - (borderTop + borderBottom), paddingTop, paddingRight, paddingBottom, paddingRight);
    }
    if (options.displayHighlight) {
      drawRect('main', borderLeft + paddingLeft, borderTop + paddingTop,
        width - (paddingLeft + paddingRight + borderLeft + borderRight),
        height - (paddingTop + paddingBottom + borderTop + borderBottom), 0, 0, 0, 0);
    }
    if (options.displayMargin) {
      drawRect('margin',
        -marginLeft, -marginTop, width + marginLeft + marginRight,
        height + marginTop + marginBottom, marginTop, marginRight, marginBottom, marginLeft);
    }

    function calcSize(size) {
      let tmp = parseInt(size, 10) * zoom;
      if (tmp > 0 && tmp < 1) {
        tmp = 1;
      }
      return Math.floor(tmp);
    }
  }

  removeDOMHighlight() {
    this.domHighlight.empty().hide();
    this.restoreFocus();
  }

  highlight(component) {
    if (app.context.page.highlightedComponent === component) {
      return;
    }
    if (app.context.page.focusedComponent === component
      || app.isInlineEditingActive()
      || !component.isVisible()) {
      this.removeHighlight();
      return;
    }
    app.context.page.highlightedComponent = component;
    if (app.isDragging) {
      return this.highlightDOMElement(component.element[0], {
        lineOnly: true
      });
    }
    this.highlightDOMElement(component.element[0]);
  }

  removeHighlight() {
    // FIXED 열자 마자 바로 닫으면 나는 오류 수정
    if (!app.context.page || !app.context.page.highlightedComponent) return false;
    app.context.page.highlightedComponent = null;
    this.removeDOMHighlight();
  }

  renderCSS() {
    this.html.fillUserStylesheet(app.context.generateUserCSS({
      env: 'builder'
    }));
  }

  resize(dimensions = {}, withAnimation = false) {
    const width = dimensions.width || app.context.canvasDimensions.width;
    const height = dimensions.height || app.context.canvasDimensions.height;
    const zoom = dimensions.zoom || app.context.canvasDimensions.zoom;
    const oldScrollTop = this.element[0].scrollTop;
    const newScrollTop = (oldScrollTop - 50) * (zoom / app.context.canvasDimensions.zoom) + 50;

    let haveResized = false;
    let haveZoomed = false;

    if (width !== app.context.canvasDimensions.width
      || height !== app.context.canvasDimensions.height) {
      haveResized = true;
    }

    if (zoom !== app.context.canvasDimensions.zoom) {
      haveZoomed = true;
    }

    if (!haveResized && !haveZoomed) {
      withAnimation = false;
    }

    if (haveZoomed) {
      withAnimation = false;
    }

    if (withAnimation) {
      this.iframe.addClass('animated');
      this.sizer.addClass('animated');
      this.hideSystemUI();
      this.removeHighlight();
      this.focusRect.hide();
      this.iframe.css({
        transform: `scale(${zoom})`,
        width,
        height
      });
      this.sizer.css({
        width: width * zoom + 100,
        height: height * zoom + 100
      });

      setTimeout(() => {
        this.iframe.removeClass('animated');
        this.sizer.removeClass('animated');
        this.scheduleRefresh();
        updateAndNotify();
      }, 400);
    } else {
      this.hideSystemUI();
      this.removeHighlight();
      this.focusRect.hide();
      this.iframe.css({
        transform: `scale(${zoom})`,
        width,
        height
      });
      this.sizer.css({
        width: width * zoom + 100,
        height: height * zoom + 100
      });
      if (haveZoomed) {
        this.element[0].scrollTop = newScrollTop;
      }
      this.scheduleRefresh();
      updateAndNotify();
    }

    function updateAndNotify() {
      app.context.canvasDimensions = {
        width,
        height,
        zoom
      };
      if (haveResized) {
        app.trigger('canvas-resized');
      }
      if (haveZoomed) {
        app.trigger('canvas-zoomed');
      }
    }
  }

  zoomIn(withAnimation = false) {
    let zoom = app.context.canvasDimensions.zoom;
    zoom += 0.25;
    if (zoom > 2) {
      zoom = 2;
    }
    this.resize({
      zoom
    }, withAnimation);
  }

  zoomOut(withAnimation = false) {
    let zoom = app.context.canvasDimensions.zoom;
    zoom -= 0.25;
    if (zoom < 0.25) {
      zoom = 0.25;
    }
    this.resize({
      zoom
    }, withAnimation);
  }

  resetZoom(withAnimation = false) {
    this.resize({
      zoom: 1
    }, withAnimation);
  }

  hideSystemUI() {
    this.element.addClass('hide-sui');
  }

  showSystemUI() {
    this.element.removeClass('hide-sui');
  }

  getSize() {
    return canvasSizesReverse[app.context.canvasDimensions.width] || 'md';
  }

  getBreakpointsForSize() {
    return Canvas.sizeLimits[this.getSize()];
  }

  scrollTo() {}
}

Canvas.sizes = {
  xs: 360,
  sm: 768,
  md: 1024,
  lg: 1200
};

Canvas.sizeLimits = {
  xs: {
    min: 0,
    max: 767
  },
  sm: {
    min: 768,
    max: 991
  },
  md: {
    min: 992,
    max: 1199
  },
  lg: {
    min: 1200,
    max: Infinity
  }
};
