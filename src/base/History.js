export default class History {
  constructor(limit, context) {
    if (limit === undefined) limit = 100;
    this.stackID = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.limit = limit;
    this.context = context;
  }

  add(item) {
    this.stackID++;
    this.undoStack.push(item);
    this.redoStack = [];
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    app.trigger('history-event', 'add', item.name, this.context);
    app.trigger('context-changed', this.context);
  }

  empty() {
    this.redoStack = [];
    this.undoStack = [];
  }

  hasUndo() {
    return !!this.undoStack.length;
  }

  hasRedo() {
    return !!this.redoStack.length;
  }

  undoName() {
    if (this.hasUndo()) {
      return `Undo "${this.undoStack[this.undoStack.length - 1].name}"`;
    }
    return 'Undo';
  }

  redoName() {
    if (this.hasRedo()) {
      return `Redo "${this.redoStack[this.redoStack.length - 1].name}"`;
    }
    return 'Redo';
  }

  undo() {
    const item = this.undoStack.pop();
    if (!item) return false;

    this.stackID--;
    item.undo();
    this.redoStack.push(item);

    if (this.redoStack.length > this.limit) {
      this.redoStack.shift();
    }
    app.trigger('history-event', 'undo', item.name, this.context);
    app.trigger('context-changed', this.context);

    return true;
  }

  redo() {
    const item = this.redoStack.pop();
    if (!item) return false;

    this.stackID++;
    item.redo();
    this.undoStack.push(item);

    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }

    app.trigger('history-event', 'redo', item.name, this.context);
    app.trigger('context-changed', this.context);
    return true;
  }
}
