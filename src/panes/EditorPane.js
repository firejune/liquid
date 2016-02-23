import Pane from './Pane.js';
import tabHandler from '../helpers/tabHandler';

class EditorPane extends Pane {
  constructor(element) {
    super(element);

    this.element = element;
    this.leftEditorContent = element.find('#left-editor .editor-content');
    this.rightEditorContent = element.find('#right-editor .editor-content');
    this.leftEditorTabHolder = element.find('#left-editor .tab-holder');
    this.rightEditorTabHolder = element.find('#right-editor .tab-holder');

    this.leftEditorGroup = null;
    this.rightEditorGroup = null;
    this.tabToEditor = new WeakMap;
    this.editorToTab = new WeakMap;
    this.tabIsDragged = false;
    this.heightBeforeContract = 0;

    tabHandler({
      app,
      tabAreas: [
        element.find('#left-editor .editor-tabs'),
        element.find('#right-editor .editor-tabs')
      ],
      onClick: this.tabClick.bind(this),
      onChange: this.afterTabReorder.bind(this),
      startDrag: this.tabStartDrag.bind(this),
      endDrag: this.tabEndDrag.bind(this)
    });

    this.element.on('click', '.editor-tabs', this.tabsClick.bind(this));
    app.on('context-activated', this.contextActivated.bind(this));
    app.on('context-closed', this.contextClosed.bind(this));
    app.on('resource-changed', this.resourceChanged.bind(this));

    // 편집 탭 열림 상태 복구
    if (electron.readSetting('editerPanelOpened')) {
      this.expand();
    }
  }

  resourceChanged(type, res) {
    if (!Array.isArray(res)) {
      res = [res];
    }

    let updateTabs = false;
    let updateLeftGroup = false;
    let updateRightGroup = false;

    for (const resource of res) {
      if (!this.resourceIsBeingEdited(resource)) continue;
      updateTabs = true;

      let editor = this.leftEditorGroup.findByResource(resource);
      if (editor && !app.context.hasResource(resource)) {
        if (editor.isActive()) {
          updateLeftGroup = true;
        }
        this.leftEditorGroup.remove(editor);
        editor.destructor();
      }
      editor = this.rightEditorGroup.findByResource(resource);
      if (editor && !app.context.hasResource(resource)) {
        if (editor.isActive()) {
          updateRightGroup = true;
        }
        this.rightEditorGroup.remove(editor);
        editor.destructor();
      }
    }

    if (updateTabs) {
      this.updateTabs();
    }
    if (updateLeftGroup) {
      this.updateLeftGroup();
    }
    if (updateRightGroup) {
      this.updateRightGroup();
    }
  }

  setEditorGroups(left, right) {
    if (this.leftEditorGroup) {
      this.leftEditorGroup.deactivate();
    }
    if (this.rightEditorGroup) {
      this.rightEditorGroup.deactivate();
    }
    left.activate();
    right.activate();
    this.leftEditorGroup = left;
    this.rightEditorGroup = right;
  }

  openForEditing(resource) {
    let editor = this.getEditorForResource(resource);

    if (!editor) {
      editor = resource.createEditor();
      this.rightEditorGroup.add(editor);
    }
    this.activateEditorAndUpdate(editor);
    this.expand();
  }

  resourceIsBeingEdited(resource) {
    return !!this.getEditorForResource(resource);
  }

  getEditorForResource(resource) {
    return this.rightEditorGroup.findByResource(resource)
      || this.leftEditorGroup.findByResource(resource);
  }

  closeEditor(editor) {
    if (editor.system) return;

    let updateLeftGroup = false;
    let updateRightGroup = false;

    if (this.leftEditorGroup.has(editor)) {
      if (editor.isActive()) {
        updateLeftGroup = true;
      }
      this.leftEditorGroup.remove(editor);
      editor.destructor();
    }

    if (this.rightEditorGroup.has(editor)) {
      if (editor.isActive()) {
        updateRightGroup = true;
      }
      this.rightEditorGroup.remove(editor);
      editor.destructor();
    }

    if (updateLeftGroup) {
      this.updateLeftGroup();
    }

    if (updateRightGroup) {
      this.updateRightGroup();
    }

    this.updateTabs();
  }

  activateEditorAndUpdate(editor) {
    if (this.rightEditorGroup.has(editor)) {
      this.rightEditorGroup.activateEditor(editor);
      this.updateRightGroup();
      this.updateTabs();
    }

    if (this.leftEditorGroup.has(editor)) {
      this.leftEditorGroup.activateEditor(editor);
      this.updateLeftGroup();
      this.updateTabs();
    }
  }

  tabClick(e) {
    const editor = this.tabToEditor.get(e.target.closest('.tab'));
    if (!editor) return;

    if (e.button === 2) {
      e.stopPropagation();
      return;
    }

    if (e.button === 1) {
      this.closeEditor(editor);
      return;
    }

    if (e.target.matches('.close')) {
      this.closeEditor(editor);
      return;
    }

    if (!editor.isActive()) {
      const elem = $(e.target);
      if (elem.is('.active')) return;
      this.activateEditorAndUpdate(editor);
    }

    this.expand();
  }

  afterTabReorder(prop) {
    const that = this;
    const leftItems = [];
    const rightItems = [];

    let updateLeftGroup = false;
    let updateRightGroup = false;
    let activeMovedToLeft = false;
    let activeMovedToRight = false;

    this.leftEditorTabHolder.find('.tab').each(function() {
      leftItems.push(that.tabToEditor.get(this));
    });

    this.rightEditorTabHolder.find('.tab').each(function() {
      rightItems.push(that.tabToEditor.get(this));
    });

    const draggedEditor = this.tabToEditor.get(prop.tab);
    if (draggedEditor.isActive()) {
      if (this.rightEditorGroup.has(draggedEditor) && rightItems.indexOf(draggedEditor) === -1) {
        this.rightEditorGroup.remove(draggedEditor);
        activeMovedToLeft = true;
      }
      if (this.leftEditorGroup.has(draggedEditor) && leftItems.indexOf(draggedEditor) === -1) {
        this.leftEditorGroup.remove(draggedEditor);
        activeMovedToRight = true;
      }
    }

    this.leftEditorGroup.set(leftItems);
    this.rightEditorGroup.set(rightItems);

    if (activeMovedToLeft) {
      this.rightEditorContent.empty();
      this.leftEditorGroup.activateEditor(draggedEditor);
    }

    if (activeMovedToRight) {
      this.leftEditorContent.empty();
      this.rightEditorGroup.activateEditor(draggedEditor);
    }

    if (this.leftEditorGroup.length && !this.leftEditorGroup.activeEditor) {
      this.leftEditorGroup.activateEditor();
      updateLeftGroup = true;
    }

    if (this.rightEditorGroup.length && !this.rightEditorGroup.activeEditor) {
      this.rightEditorGroup.activateEditor();
      updateRightGroup = true;
    }

    this.updateTabs();
    if (activeMovedToRight || activeMovedToLeft || updateLeftGroup) {
      this.updateLeftGroup();
    }

    if (activeMovedToRight || activeMovedToLeft || updateRightGroup) {
      this.updateRightGroup();
    }
  }

  tabStartDrag() {
    this.tabIsDragged = true;
  }

  tabEndDrag() {
    setTimeout(() => {
      this.tabIsDragged = false;
    }, 50);
  }

  tabsClick(e) {
    if (this.tabIsDragged) return;

    const elem = $(e.target);
    if (this.element.hasClass('expanded')) {
      if (elem.closest('.tab').length) return;
      this.contract();
    } else {
      this.expand();
    }
  }

  contract() {
    if (!this.element.hasClass('expanded')) return;
    this.heightBeforeContract = this.element.height();
    this.element.height(25);
    this.element.removeClass('expanded');

    electron.saveSetting('editerPanelOpened', false);
  }

  expand() {
    if (this.element.hasClass('expanded')) return;

    let height = this.heightBeforeContract;
    if (height < 150) {
      height = win.height() / 2;
    }
    this.element.height(height);
    this.element.addClass('expanded');

    electron.saveSetting('editerPanelOpened', true);
  }

  contextActivated() {
    this.setEditorGroups(app.context.leftEditorGroup, app.context.rightEditorGroup);
    this.update();
  }

  contextClosed(ctx) {
    ctx.destructEditors();
  }

  updateLeftGroup() {
    this.leftEditorContent.html(this.leftEditorGroup.scheduleUpdate());
    if (this.leftEditorGroup.activeEditor) {
      this.leftEditorGroup.activeEditor.restoreScrollOffset();
    }
  }

  updateRightGroup() {
    this.rightEditorContent.html(this.rightEditorGroup.scheduleUpdate());
    if (this.rightEditorGroup.activeEditor) {
      this.rightEditorGroup.activeEditor.restoreScrollOffset();
    }
  }

  updateTabs() {
    let tabs = [];

    for (const e of this.leftEditorGroup.getAll()) {
      const tab = this.renderTabForEditor(e);
      tabs.push(tab);
      this.tabToEditor.set(tab[0], e);
      this.editorToTab.set(e, tab[0]);
    }

    // this.leftEditorTabHolder.html(tabs);
    this.leftEditorTabHolder.find('> div:first').remove();
    this.leftEditorTabHolder.prepend(tabs);
    tabs = [];

    for (const e of this.rightEditorGroup.getAll()) {
      const tab = this.renderTabForEditor(e);
      tabs.push(tab);
      this.tabToEditor.set(tab[0], e);
      this.editorToTab.set(e, tab[0]);
    }

    // this.rightEditorTabHolder.html(tabs);
    this.rightEditorTabHolder.find('> div:first').remove();
    this.rightEditorTabHolder.prepend(tabs);
  }

  updateTabForEditor(editor) {
    const node = this.editorToTab.get(editor);
    if (!node) return;

    const newNode = this.renderTabForEditor(editor);
    $(node).replaceWith(newNode);
    this.tabToEditor.set(newNode[0], editor);
    this.editorToTab.set(editor, newNode[0]);
  }

  renderTabForEditor(editor) {
    const tab = $([
      '<div class="tab">',
      '	<span class="title"></span>',
      '	<span class="close"></span>',
      '</div>'
    ].join('\n'));

    tab[0].firstElementChild.textContent = editor.getName();
    tab.toggleClass('active', editor.isActive());
    tab.toggleClass('can-be-closed', !editor.system);

    if (editor.isSaved) {
      tab.toggleClass('unsaved', !editor.isSaved());
    }

    return tab;
  }

  update() {
    this.updateLeftGroup();
    this.updateRightGroup();
    this.updateTabs();

    return this.element;
  }
}

export default EditorPane;
