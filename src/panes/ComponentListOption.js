import OptionItem from './OptionItem';
import ButtonOption from '../panes/ButtonOption';
import LinkOption from '../panes/LinkOption';
import getSmartProp from '../helpers/getSmartProp';
import setSmartProp from '../helpers/setSmartProp';

class ComponentListOption extends OptionItem {
  constructor(options) {
    super(options);

    this.component = options.component;
    this.formFields = [];
    this.element = $(
      '<div class="component-list-option">' +
      '<ul></ul>' +
      '<div class="form-holder"></div> <a class="add-button button darkgray">Add</a>' +
      '</div>'
    );
    this.isDragging = false;
    this.domNodeToComponent = new WeakMap;
    this.offsetTop = 0;
    this.addForm = options.addForm;
    this.editForm = options.editForm;
    this.onFormSave = options.onFormSave;
    this.addClick = options.addClick;
    this.itemRepresentation = options.itemRepresentation || function() {};
  }

  bindEventListeners() {
    this.element.off();
    this.element.on('mousedown', 'li .handle', this.handleMousedown.bind(this));
    this.element.on('click', 'li .edit', this.editClick.bind(this));
    this.element.on('click', 'li .delete', this.deleteClick.bind(this));
    this.element.on('click', 'li span', this.spanClick.bind(this));
    this.element.on('click', '.add-button', this.addButtonClick.bind(this));
    this.element.on('mouseup', this.mouseup.bind(this));
    this.element.on('mouseleave', this.mouseleave.bind(this));
    this.element.on('mousemove', this.mousemove.bind(this));
  }

  shouldShow(type, item) {
    if (!(type in this._options.actions)) {
      return false;
    }
    if (typeof this._options.actions[type] === 'boolean') {
      return this._options.actions[type];
    }
    if (typeof this._options.actions[type].condition === 'function') {
      return this._options.actions[type].condition(item);
    }
    return false;
  }

  hasAction(type) {
    return type in this._options.actions
      && typeof this._options.actions[type].action === 'function';
  }

  executeAction(type, param) {
    return this._options.actions[type].action(param);
  }

  getItems() {
    return getSmartProp(this._options.items);
  }

  setItems(val) {
    return setSmartProp(this._options.items, val);
  }

  addButtonClick() {
    if (this.addForm) {
      this.showAddForm();
    } else if (this.addClick) {
      this.addClick();
    }
  }

  showAddForm() {
    const formHolder = this.element.find('.form-holder');
    formHolder.empty().show();

    this.formFields = this.addForm();

    const button = new ButtonOption({
      text: 'Create',
      onClick: () => {
        const item = this.onFormSave(this.formFields);
        const oldItems = this.getItems();
        const newItems = oldItems.slice();

        newItems.push(item);
        this.setItems(newItems);
        this.component.update();

        app.context.history.add({
          name: `Create New ${this.component.getName()} Entry`,
          undo: () => {
            this.setItems(oldItems);
            this.component.update();
          },
          redo: () => {
            this.setItems(newItems);
            this.component.update();
          }
        });
      }
    });

    const link = new LinkOption({
      text: 'Cancel',
      onClick: () => {
        this.hideForm();
        this.removeHighlight();
      }
    });

    this.formFields.forEach(f => formHolder.append(f.update()));

    formHolder.append(button.update());
    formHolder.append(link.update());
  }

  showEditForm(component) {
    const formHolder = this.element.find('.form-holder');
    formHolder.empty().show();

    this.formFields = this.editForm(component);
    const button = new ButtonOption({
      text: 'Save Item',
      onClick: () => {
        const items = this.getItems().slice();
        const index = items.indexOf(component);
        const oldItem = component;
        const newItem = this.onFormSave(this.formFields);

        items[index] = newItem;

        this.setItems(items);
        this.component.update();

        app.context.history.add({
          name: `Edit ${this.component.getName()} Entry`,
          undo: () => {
            items[index] = oldItem;
            this.setItems(items);
            this.component.update();
          },
          redo: () => {
            items[index] = newItem;
            this.setItems(items);
            this.component.update();
          }
        });
      }
    });

    const link = new LinkOption({
      text: 'Cancel',
      onClick: () => {
        this.hideForm();
        this.removeHighlight();
      }
    });

    this.formFields.forEach(f => formHolder.append(f.update()));

    formHolder.append(button.update());
    formHolder.append(link.update());
  }

  hideForm() {
    const formHolder = this.element.find('.form-holder');

    this.formFields = [];
    formHolder.empty().hide();
  }

  removeHighlight() {
    this.element.find('.highlighted').removeClass('highlighted');
  }

  mouseleave() {
    this.mouseup();
  }

  /**
   * @param e
   */
  mouseup() {
    if (!this.isDragging) return;

    const node = this.draggedNode;
    const ul = this.draggedNode.parentNode;

    this.isDragging = false;
    this.draggedNodeTop = null;
    this.draggedNodeIndex = null;
    this.draggedNode.classList.add('animated');
    this.draggedNode.parentNode.classList.remove('drag-enabled');
    this.draggedNode.style.transform = '';
    this.draggedNode = null;

    const newItems = [];
    const oldItems = this.getItems().slice();
    for (let i = 0; i < ul.children.length; i++) {
      newItems.push(this.domNodeToComponent.get(ul.children[i]));
    }

    if (!newItems.every((item, index) => oldItems[index] === item)) {
      this.setItems(newItems);
      this.component.update();
      app.context.history.add({
        name: `Reorder ${this.component.getName()} Items`,
        undo: () => {
          this.setItems(oldItems);
          this.component.update();
        },
        redo: () => {
          this.setItems(newItems);
          this.component.update();
        }
      });
    }

    setTimeout(() => {
      node.classList.remove('animated');
      node.classList.remove('dragged');
    }, 150);
  }

  editClick(e) {
    const component = this.domNodeToComponent.get(e.currentTarget.parentNode);
    if (this.hasAction('edit')) {
      return this.executeAction('edit', component);
    } else if (this.editForm) {
      this.element.find('.highlighted').removeClass('highlighted');
      e.currentTarget.parentNode.classList.add('highlighted');
      this.showEditForm(component);
    }
  }

  deleteClick(e) {
    const component = this.domNodeToComponent.get(e.currentTarget.parentNode);
    if (this.hasAction('delete')) {
      return this.executeAction('delete', component);
    }

    this.hideForm();

    const items = this.getItems().slice();
    const oldItems = items.slice();
    const index = items.indexOf(component);
    if (index === -1) {
      return;
    }

    items.splice(index, 1);
    this.setItems(items);
    this.component.update();

    app.context.history.add({
      name: `Delete ${this.component.getName()} Item`,
      undo: () => {
        this.setItems(oldItems);
        this.component.update();
      },
      redo: () => {
        this.setItems(items);
        this.component.update();
      }
    });
  }

  spanClick(e) {
    if (!this.editForm) {
      return false;
    }
    this.hideForm();

    const component = this.domNodeToComponent.get(e.currentTarget.parentNode);
    this.element.find('.highlighted').removeClass('highlighted');
    e.currentTarget.parentNode.classList.add('highlighted');
    this.showEditForm(component);
  }

  handleMousedown(e) {
    this.hideForm();

    // const component = this.domNodeToComponent.get(e.currentTarget.parentNode);
    this.isDragging = true;
    this.draggedNode = e.currentTarget.parentNode;
    this.draggedNodeIndex =
      Array.from(this.draggedNode.parentNode.children).indexOf(this.draggedNode);
    this.draggedNode.classList.add('dragged');
    this.offsetTop = e.pageY - this.draggedNode.getBoundingClientRect().top;
    this.draggedNode.parentNode.classList.add('drag-enabled');
    this.draggedNodeTop = null;
    this.removeHighlight();
  }

  mousemove(e) {
    if (!this.isDragging) return;
    if (!this.draggedNodeTop) {
      this.draggedNodeTop = this.draggedNode.getBoundingClientRect().top;
    }

    this.draggedNode.style.transform =
      `translateY(${e.pageY - (this.draggedNodeTop + this.offsetTop)}px)`;

    const elem = document.elementFromPoint(e.pageX, e.pageY);
    const over = elem.closest('li');
    let moved = false;
    if (!over) return;

    const overIndex = Array.from(over.parentNode.children).indexOf(over);
    const box = over.getBoundingClientRect();
    if (box.top + box.height / 2 > e.pageY) {
      if (this.draggedNodeIndex === overIndex - 1) return;
      over.insertAdjacentElement('beforeBegin', this.draggedNode);
      this.draggedNodeIndex = overIndex;
      moved = true;
    } else if (box.bottom - box.height / 2 < e.pageY) {
      if (this.draggedNodeIndex === overIndex + 1) return;
      over.insertAdjacentElement('afterEnd', this.draggedNode);
      this.draggedNodeIndex = overIndex;
      moved = true;
    }

    if (moved) {
      this.draggedNodeTop = box.top;
      this.draggedNode.style.transform =
        `translateY(${e.pageY - (this.draggedNodeTop + this.offsetTop)}px)`;
    }
  }

  update() {
    super.update();

    let li;
    const ul = $('<ul>');
    const items = this.getItems();

    for (let i = 0; i < items.length; i++) {
      li = $('<li class="gray-item"><i class="handle"></i><span class="name"></span></li>');
      li.find('span').text(this.itemRepresentation(items[i]));

      if (this.shouldShow('delete', items[i])) {
        li.append('<b class="delete">&times;</b>');
      }

      if (this.shouldShow('edit', items[i])) {
        li.append('<b class="edit"><i class="material-icon">mode_edit</i></b>');
      }

      this.domNodeToComponent.set(li[0], items[i]);
      ul.append(li);
    }

    this.element.find('ul').replaceWith(ul);
    this.element.find('.form-holder').empty();
    this.bindEventListeners();

    return this.element;
  }
}

export default ComponentListOption;
