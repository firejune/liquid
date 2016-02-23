class Pane {
  constructor() {
    this.element = null;
    app.on('resize pane-resize', this.updateDimensions.bind(this));
    this.dimensions = {};
    this.contentDimensions = {};
    this._updateFunc = this.update.bind(this);
  }

  updateDimensions() {
    this.dimensions = this.element[0].getBoundingClientRect();
    if (this.content) {
      this.contentDimensions = this.content[0].getBoundingClientRect();
    }
  }

  scheduleUpdate(time = 20) {
    clearTimeout(this._updateTimer);
    this._updateTimer = setTimeout(this._updateFunc, time);
  }
}

export default Pane;
