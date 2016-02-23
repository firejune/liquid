import InputBase from './InputBase';
import ComponentListOption from '../panes/ComponentListOption';
import TextBoxOption from '../panes/TextBoxOption';
import SelectOption from '../panes/SelectOption';
import CheckBoxOption from '../panes/CheckBoxOption';
import clone from 'clone';

class Select extends InputBase {
  constructor() {
    super();
    this.element = $('<select>');
    this.addCapabilities(['size', 'autofocus', 'multiple']);
    this.items = [];
    this.defineGroups({
      id: 'select-items',
      label: 'Items',
      weight: 9
    });
  }

  initialize() {
    this.items = [{
      label: 'This is a group',
      type: 'OptionGroup'
    }, {
      label: 'This is item 1',
      value: '12',
      type: 'OptionItem',
      selected: true
    }, {
      label: 'This is item 2',
      value: '13',
      type: 'OptionItem'
    }, {
      label: 'This is item 3',
      value: '14',
      type: 'OptionItem'
    }];
  }

  focus() {
    super.focus();

    const selectItemsGroup = app.optionsPane.getById('select-items');
    const listOption = new ComponentListOption({
      component: this,
      items: [this, 'items'],
      itemRepresentation: item => {
        let text = item.label.trim();
        if (!text.length) {
          text = `<${item.type}>`;
        }
        return text;
      },
      actions: {
        'delete': true,
        edit: true
      },
      addForm: () => {
        const label = new TextBoxOption({
          label: 'Label',
          value: ''
        });
        const value = new TextBoxOption({
          label: 'Value',
          value: ''
        });
        const selected = new CheckBoxOption({
          label: 'Selected',
          value: false
        });
        const type = new SelectOption({
          label: 'Type',
          value: 'OptionItem',
          options: [{
            label: 'Option',
            value: 'OptionItem'
          }, {
            label: 'Option Group',
            value: 'OptionGroup'
          }],
          onChange: inputtype => {
            selected.hide();
            value.hide();
            if (inputtype === 'OptionItem') {
              selected.show();
              value.show();
            }
          }
        });

        return [type, label, value, selected];
      },
      editForm: item => {
        const label = new TextBoxOption({
          label: 'Label',
          value: item.label || ''
        });
        const value = new TextBoxOption({
          label: 'Value',
          value: item.value || '',
          visible: item.type === 'OptionItem'
        });
        const selected = new CheckBoxOption({
          label: 'Selected',
          value: item.selected || false,
          visible: item.type === 'OptionItem'
        });
        const type = new SelectOption({
          label: 'Type',
          value: item.type,
          options: [{
            label: 'Option',
            value: 'OptionItem'
          }, {
            label: 'Option Group',
            value: 'OptionGroup'
          }],
          onChange: inputtype => {
            selected.hide();
            value.hide();
            if (inputtype === 'OptionItem') {
              selected.show();
              value.show();
            }
          }
        });
        return [type, label, value, selected];
      },
      onFormSave: fields => {
        const type = fields[0].val();
        const item = {
          type,
          label: fields[1].val()
        };
        if (type === 'OptionItem') {
          item.value = fields[2].val();
          item.selected = fields[3].val();
        }
        return item;
      }
    });

    selectItemsGroup.add(listOption);
  }

  update() {
    this.element.empty();

    const html = document.createDocumentFragment();
    let item;
    let group;
    let option;

    for (let i = 0; i < this.items.length; i++) {
      item = this.items[i];
      if (item.type === 'OptionGroup') {
        group = renderGroup(item);
        html.appendChild(group);
        continue;
      }
      option = renderOption(item);
      if (group) {
        group.appendChild(option);
      } else {
        html.appendChild(option);
      }
    }
    this.element.html(html);

    return super.update();
  }

  serialize() {
    const obj = super.serialize();
    obj.items = this.items;
    return obj;
  }

  unserialize(obj) {
    super.unserialize(obj);

    if (Array.isArray(obj.items)) {
      this.items = clone(obj.items);
    }
  }
}

function renderOption(o) {
  const option = document.createElement('option');
  option.setAttribute('value', o.value);
  option.textContent = o.label;
  if (o.selected) {
    option.setAttribute('selected', '');
  }
  return option;
}

function renderGroup(g) {
  const group = document.createElement('optgroup');
  group.setAttribute('label', g.label);
  if (g.disabled) {
    group.setAttribute('disabled', '');
  }
  return group;
}

export default Select;
