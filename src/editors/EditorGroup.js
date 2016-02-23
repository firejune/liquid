class EditorGroup {
  constructor() {
    this.items = [];
    this.activeEditor = null;
    this.active = false;
  }

  activate() {
    this.active = true;
    this.activeEditor && this.activeEditor.activate();
  }

  deactivate() {
    this.active = false;
    this.activeEditor && this.activeEditor.deactivate();
  }

  isActive() {
    return this.active;
  }

  activateEditor(editor) {
    if (!editor) {
      editor = this.items[0] || null;
    }
    if (this.activeEditor) {
      this.activeEditor.deactivate();
    }
    this.activeEditor = editor;
    editor && editor.activate();
  }

  destructEditors() {
    for (const editor of this.items) {
      editor.destructor();
    }
  }

  set(items) {
    this.items = items;
  }

  has(editor) {
    return this.items.indexOf(editor) !== -1;
  }

  findIndexFor(editor) {
    return this.items.indexOf(editor);
  }

  findByResource(res) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].resource === res) return this.items[i];
    }
    return null;
  }

  get(index) {
    return this.items[index];
  }

  getAll() {
    return this.items.slice();
  }

  isEditorActive(editor) {
    return !!editor && this.activeEditor === editor;
  }

  add(editors) {
    if (!Array.isArray(editors)) {
      editors = [editors];
    }

    this.items.push.apply(this.items, editors);

    if (!this.activeEditor) {
      this.activateEditor();
    }
  }

  remove(editor) {
    const index = this.findIndexFor(editor);
    if (index === -1) return;

    this.items.splice(index, 1);

    if (this.isEditorActive(editor)) {
      this.activateEditor();
    }

    return editor;
  }

  update() {
    if (this.activeEditor) {
      return this.activeEditor.update();
    }
    return document.createDocumentFragment();
  }

  scheduleUpdate() {
    if (this.activeEditor) {
      return this.activeEditor.scheduleUpdate();
    }
    return document.createDocumentFragment();
  }

  get length() {
    return this.items.length;
  }
}

export default EditorGroup;
