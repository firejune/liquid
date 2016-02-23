import CodeEditor from './CodeEditor';

class JSEditor extends CodeEditor {
  constructor(resource) {
    super(resource, 'javascript', 'JavaScript Edited');
  }
}

export default JSEditor;
