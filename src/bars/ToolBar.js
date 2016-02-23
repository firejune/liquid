import Bar from './Bar';
import Canvas from '../base/Canvas';

export default class ToolBar extends Bar {
  constructor(elem) {
    super();

    this.element = elem;

    elem.on('click', '.button-size', this.clickResize.bind(this));
    elem.on('click', '.button-zoom', this.clickZoom.bind(this));
    elem.on('click', '.toggle-grid', this.toggleGrid.bind(this));
    elem.on('click', '.page-selection', this.clickPageSelection.bind(this));

    this.zoomInElement = elem.find('.zoom-in');
    this.zoomOutElement = elem.find('.zoom-out');
    this.gridElement = elem.find('.toggle-grid');
    this.buttonSizes = elem.find('.button-size');
    this.info = elem.find('.info');
    this.pageSelection = elem.find('.page-selection');

    app.on('context-activated canvas-resized canvas-zoomed page-activated', this.update.bind(this));
  }

  /**
   * @param e
   */
  toggleGrid() {
    // const elem = $(e.currentTarget);
    app.context.uiState.visualizeGrid = !app.context.uiState.visualizeGrid;
    app.canvas.refresh();
    this.update();
  }

  clickPageSelection(e) {
    const options = [];

    for (const page of app.context.pages.getAll()) {
      options.push({
        name: page.name,
        action: pageClick.bind(this, page),
        disabled: page.isActive()
      });
    }

    options.push({
      name: 'New Page',
      action: () => {
        const page = app.designPane.createNewPage();
        app.activatePage(page);
      }
    });

    const rect = e.target.getBoundingClientRect();
    app.contextMenu.show(rect.right, rect.bottom - 6, options, {
      preferLeft: true
    });

    function pageClick(page) {
      app.activatePage(page);
    }
  }

  clickResize(e) {
    if (blockFor(500)) return;

    const width = Canvas.sizes[e.currentTarget.dataset.id];
    app.canvas.resize({
      width
    }, true);
    this.buttonSizes.removeClass('active');
    $(e.currentTarget).addClass('active');
  }

  clickZoom(e) {
    if (e.currentTarget.dataset.id === 'zoom-in') {
      app.canvas.zoomIn();
    } else {
      app.canvas.zoomOut();
    }
    this.update();
  }

  update() {
    this.show();
    this.zoomInElement.toggleClass('active', app.context.canvasDimensions.zoom < 2);
    this.zoomOutElement.toggleClass('active', app.context.canvasDimensions.zoom > 0.25);
    this.gridElement.toggleClass('on', app.context.uiState.visualizeGrid);
    if (app.context.uiState.visualizeGrid) {
      this.gridElement.attr('title', 'Grid Is Visible');
    } else {
      this.gridElement.attr('title', 'Grid Is Hidden');
    }
    this.pageSelection.text(app.context.page.name);
    this.buttonSizes.removeClass('active');
    this.buttonSizes.filter(`.${app.canvas.getSize()}`).addClass('active');
    this.info.text(
      `${Math.floor(app.context.canvasDimensions.width)}px × ` +
      `${Math.floor(app.context.canvasDimensions.height)}px @ ` +
      `${Math.round(app.context.canvasDimensions.zoom * 100)}%`
    );
  }
}

let blocked = false;

function blockFor(n) {
  if (blocked) {
    return true;
  }

  blocked = true;

  setTimeout(() => {
    blocked = false;
  }, n);

  return false;
}
