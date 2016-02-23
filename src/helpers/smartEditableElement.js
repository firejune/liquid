class SmartEditable {
  constructor(options) {
    this.options = options;

    if (options.doubleClickEditing) {
      options.element.on('dblclick', '.name', this.editIt.bind(this));
    }

    options.element.on('click', '.edit', this.editIt.bind(this));
    options.element.on('click', '.delete', this.deleteIt.bind(this));
    this.ignoreFocusout = false;
  }

  editIt(e) {
    const target = $(e.target).closest('.smart-editable');
    this.startEditing(target);
  }

  startEditing(item) {
    const input = item.find('input');

    let value;
    if (item.find('.name')[0].dataset.hasOwnProperty('editvalue')) {
      value = item.find('.name').data('editvalue');
    } else {
      value = item.find('.name').text();
    }

    item.addClass('editing');
    input.val(value).focus();
    this.options.element.on('focusout', 'input', this.focusout.bind(this));
    this.options.element.on('keydown', 'input', this.keydown.bind(this));

    if (this.options.onStartEdit) {
      this.options.onStartEdit();
    }
  }

  stopEditing() {
    this.options.element.off('focusout keydown');
    this.options.element.find('.editing').removeClass('editing');
    if (this.options.onStopEdit) {
      this.options.onStopEdit();
    }
  }

  focusout() {
    if (this.ignoreFocusout) {
      return;
    }
    this.commitIt();
  }

  keydown(e) {
    // ESC
    if (e.which === 27) {
      this.stopEditing();

    // Enter
    } else if (e.which === 13) {
      this.commitIt();
    }
  }

  commitIt(e) {
    this.ignoreFocusout = true;

    setTimeout(() => {
      this.ignoreFocusout = false;
    }, 100);

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const item = this.options.element.find('.editing');
    const result = this.options.onCommit(item, item.find('input').val());
    if (result !== false) {
      this.stopEditing();
    }
  }

  deleteIt(e) {
    const target = $(e.target);
    const item = target.closest('.smart-editable');
    this.delete(item);
  }

  _delete(item) {
    this.options.onDelete(item);
  }
}

export default function smartEditableElement(options) {
  return new SmartEditable(options);
}
