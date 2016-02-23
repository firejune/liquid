import Editor from './Editor';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/search';
import 'codemirror/keymap/sublime';

class CodeEditor extends Editor {
  /**
   * @param resource
   * @param mode
   * @param {string} [historyTitle = 'Resource Edited']
   */
  constructor(resource, mode) {
    super();

    this.resource = resource;
    this.mode = mode;
    this.element = $(
      '\n			<div class="code-editor editor">' +
      '\n				<div class="toolbar">' +
      '\n					<a class="button darkgray save">Apply</a>' +
      '\n					<a class="button darkgray search icon" title="Find">' +
      '<i class="material-icon">search</i></a>' +
      '\n					<a class="button darkgray replace icon" title="Replace">' +
      '<i class="material-icon">find_replace</i></a>' +
      '\n				</div>' +
      '\n				<div class="content"></div>' +
      '\n			</div>' +
      '\n		'
    );
    this.originalResourceValue = resource.value;
    this.historyAffectedButtonGroup = this.element.find('.save, .discard');
    this.ignoreResourceEdited = false;
    this.editorFocused = false;

    this.codeMirror = CodeMirror(cm => {
      this.element.find('.content').append(cm);
    }, {
      value: this.resource.value,
      mode,
      lineNumbers: true,
      inputStyle: 'contenteditable',
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      extraKeys: {
        /**
         * @param {function} cm
         */
        [electron.os === 'osx' ? 'Cmd-S' : 'Ctrl-S']: () => {
          this.save();
        },
        ['Tab']: cm => {
          if (cm.doc.somethingSelected()) {
            return CodeMirror.Pass;
          }
          const spacesPerTab = cm.getOption('indentUnit');
          const spacesToInsert = spacesPerTab - cm.doc.getCursor('start').ch % spacesPerTab;
          const spaces = Array(spacesToInsert + 1).join(' ');
          cm.replaceSelection(spaces, 'end', '+input');
        }
      },
      theme: 'bstudio'
    });

    this.changeGeneration = this.codeMirror.doc.changeGeneration();
    this.lastHasChangeStatus = false;
    this.paneResizeListener = this.paneResized.bind(this);
    this.resourceEditedListener = this.resourceEdited.bind(this);

    app.on('resource-edited', this.resourceEditedListener);
  }

  destructor() {
    app.off('resource-edited', this.resourceEditedListener);
  }

  bindEventListeners() {
    super.bindEventListeners();

    this.element.on('click', '.save', this.saveButtonClick.bind(this));
    this.element.on('click', '.discard', this.discardButtonClick.bind(this));
    this.element.on('click', '.search', this.searchButtonClick.bind(this));
    this.element.on('click', '.replace', this.replaceButtonClick.bind(this));
    this.codeMirror.on('changes', this.editorChanges.bind(this));
    app.on('pane-resize', this.paneResizeListener);
  }

  unbindEventListeners() {
    super.unbindEventListeners();

    this.element.off();
    this.codeMirror.off('changes');
    app.off('pane-resize', this.paneResizeListener);
  }

  resourceEdited(resource) {
    if (resource !== this.resource) return;
    if (this.ignoreResourceEdited) return;
    this.codeMirror.doc.setValue(this.resource.value);
    this.originalResourceValue = this.resource.value;
    this.codeMirror.doc.clearHistory();
    this.changeGeneration = this.codeMirror.doc.changeGeneration();
    this.lastHasChangeStatus = false;
    app.editorPane.updateTabForEditor(this);
    this.update();
  }

  editorChanges() {
    if (this.lastHasChangeStatus !== this.hasChanges()) {
      this.lastHasChangeStatus = this.hasChanges();
      app.editorPane.updateTabForEditor(this);
      this.update();
    }
  }

  saveButtonClick() {
    this.save();
  }

  discardButtonClick() {
    this.discard();
  }

  searchButtonClick() {
    this.codeMirror.execCommand('find');
  }

  replaceButtonClick() {
    this.codeMirror.execCommand('replace');
  }

  paneResized() {
    this.codeMirror.refresh();
  }

  getName() {
    return this.resource.name;
  }

  hasChanges() {
    return this.changeGeneration !== this.codeMirror.doc.changeGeneration();
  }

  isSaved() {
    return !this.hasChanges();
  }

  save() {
    if (!this.hasChanges()) return;
    this.changeGeneration = this.codeMirror.doc.changeGeneration();

    const resource = this.resource;
    const oldValue = resource.value;
    const newValue = this.codeMirror.doc.getValue();
    resource.value = newValue;

    this.originalResourceValue = newValue;
    this.lastHasChangeStatus = false;
    this.ignoreResourceEdited = true;
    app.trigger('resource-edited', resource);
    this.ignoreResourceEdited = false;

    app.context.history.add({
      name: history,
      undo: () => {
        resource.value = oldValue;
        app.trigger('resource-edited', resource);
      },
      redo: () => {
        resource.value = newValue;
        app.trigger('resource-edited', resource);
      }
    });

    app.editorPane.updateTabForEditor(this);
    this.update();

    setTimeout(() => {
      this.codeMirror.focus();
    }, 20);
  }

  activate() {
    super.activate();

    setTimeout(() => {
      this.codeMirror.focus();
      this.codeMirror.refresh();
    }, 20);
  }

  update() {
    this.historyAffectedButtonGroup.toggleClass('active', this.hasChanges());
    return this.element;
  }
}

export default CodeEditor;
