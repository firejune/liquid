import Component from './Component';
import ComponentWithChildren from './ComponentWithChildren';
import ComponentListOption from '../panes/ComponentListOption';
import SelectOption from '../panes/SelectOption';
import Button from './Button';
import Caret from './Caret';
import Anchor from './Anchor';
import DropdownMenuItem from './DropdownMenuItem';
import DropdownDivider from './DropdownDivider';
import DropdownHeader from './DropdownHeader';
import ButtonGroup from './ButtonGroup';
import Nav from './Nav';

export default class Dropdown extends ComponentWithChildren {
  constructor() {
    super();

    this.defineGroups({
      id: 'dropdown-items',
      label: 'Items',
      weight: 9
    });

    this.defineProperties([{
      id: 'type',
      label: 'Type',
      type: 'select',
      value: 'dropdown',
      options: [{
        value: 'dropdown',
        label: 'Dropdown'
      }, {
        value: 'dropup',
        label: 'Dropup'
      }]
    }, {
      id: 'expanded',
      label: 'Expanded',
      type: 'checkbox',
      value: false
    }, {
      id: 'alignment',
      label: 'Alignment',
      type: 'select',
      value: '',
      options: [{
        value: '',
        label: 'Default'
      }, {
        value: 'left',
        label: 'Left'
      }, {
        value: 'right',
        label: 'Right'
      }]
    }]);

    this.dropdownItemsOffset = 1;
    this.element = $('<div>');
    this._button = new Button;
    this._button.initialize('Dropdown ');
    this._button.cssClasses.parent = 'dropdown-toggle';
    this._button.fixate();
    this._link = new Anchor;
    this._link.initialize();
    this._link.cssClasses.parent = 'dropdown-toggle';
    this._link.fixate();
  }

  initialize() {
    this.insertFirst(this._button);
    const caret = new Caret;
    caret.initialize();
    caret.freeze();
    this._button.insertLast(caret);

    let d = new DropdownMenuItem;
    d.initialize('First Item', '#');
    this.insertLast(d);

    d = new DropdownMenuItem;
    d.initialize('Second Item', '#');
    this.insertLast(d);

    d = new DropdownMenuItem;
    d.initialize('Third Item', '#');
    this.insertLast(d);
  }

  focus() {
    super.focus();

    const dropdownItemsGroup = app.optionsPane.getById('dropdown-items');
    const listOption = new ComponentListOption({
      component: this,
      items: _items => {
        if (_items) {
          this.children = this.children.slice(0, this.dropdownItemsOffset);
          for (let i = 0; i < _items.length; i++) {
            this.insertLast(_items[i]);
          }
          return;
        }
        return this.children.slice(this.dropdownItemsOffset);
      },
      itemRepresentation: item => {
        let text = item.element.text().trim();
        if (!text.length) {
          if (item instanceof DropdownMenuItem) {
            text = '<Menu Item>';
          } else if (item instanceof DropdownHeader) {
            text = '<Header>';
          } else {
            text = '<Divider>';
          }
        }
        return text;
      },
      actions: {
        edit: {
          condition: item => item instanceof DropdownMenuItem || item instanceof DropdownHeader,
          action: item => {
            if (!this.properties.expanded) {
              this.properties.expanded = true;
              this.update();
              app.context.history.add({
                name: 'Expand Dropdown',
                undo: () => {
                  this.properties.expanded = false;
                  this.update();
                },
                redo: () => {
                  this.properties.expanded = true;
                  this.update();
                }
              });
            }
            if (item instanceof DropdownMenuItem) {
              const link = item.children[0];
              link.focus();
              link.activateInlineEditing();
            } else {
              item.focus();
              item.activateInlineEditing();
            }
          }
        },
        'delete': true
      },
      addForm: () => {
        const selectBox = new SelectOption({
          label: 'Type',
          value: 'DropdownMenuItem',
          options: [{
            label: 'Menu Item',
            value: 'DropdownMenuItem'
          }, {
            label: 'Header',
            value: 'DropdownHeader'
          }, {
            label: 'Divider',
            value: 'DropdownDivider'
          }]
        });
        return [selectBox];
      },
      onFormSave: fields => {
        const type = fields[0].val();
        let item = null;
        if (type === 'DropdownMenuItem') {
          item = new DropdownMenuItem;
          item.initialize('Menu Item');
        } else if (type === 'DropdownHeader') {
          item = new DropdownHeader;
          item.initialize('Header');
        } else {
          item = new DropdownDivider;
          item.initialize();
        }
        return item;
      }
    });
    dropdownItemsGroup.add(listOption);
  }

  /**
   * @param component
   */
  canTakeChild() {
    return false;
  }

  update() {
    let tmp;
    let showLink = false;

    this.cssClasses.system = this.properties.type;
    delete this.attributes.role;

    const InputGroupAddon = require('./InputGroupAddon').default;
    if (this.parent instanceof ButtonGroup || this.parent instanceof InputGroupAddon) {
      tmp = $('<div><ul class="dropdown-menu" role="menu"></ul></div>');
      this.attributes.role = 'group';
      this.cssClasses.system += ' btn-group';
    } else if (this.parent instanceof Nav) {
      tmp = $('<li><ul class="dropdown-menu" role="menu"></ul></li>');
      showLink = true;
    } else {
      tmp = $('<div><ul class="dropdown-menu" role="menu"></ul></div>');
    }

    this.element.replaceWith(tmp);
    this.element = tmp;
    if (showLink && this.children[0] instanceof Button) {
      this._button = this.children[0];
      this._button.remove();
      this._link.copyChildrenFrom(this._button);
      this.insertFirst(this._link);
    }
    if (!showLink && this.children[0] instanceof Anchor) {
      this._link = this.children[0];
      this._link.remove();
      this._button.copyChildrenFrom(this._link);
      this.insertFirst(this._button);
    }
    if (this.properties.expanded) {
      this.cssClasses.system += ' open';
    }
    this.children[0].attributes['data-toggle'] = 'dropdown';
    Component.prototype.startUpdate.call(this);
    this.children[0].attributes['aria-expanded'] = 'false';
    if (this.properties.expanded) {
      this.children[0].attributes['aria-expanded'] = 'true';
    }
    this.element.prepend(this.children[0].update());
    this.updateMenu();
    return Component.prototype.finishUpdate.call(this);
  }

  updateMenu() {
    const ul = this.element.find('ul');
    ul.toggleClass('dropdown-menu-left', this.properties.alignment === 'left');
    ul.toggleClass('dropdown-menu-right', this.properties.alignment === 'right');
    ul.empty();
    for (let i = this.dropdownItemsOffset; i < this.children.length; i++) {
      ul.append(this.children[i].update());
    }
  }
}
