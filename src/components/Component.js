import Box from '../base/Box';
import TextBoxOption from '../panes/TextBoxOption';
import GroupOption from '../panes/GroupOption';
import BreadcrumbsOption from '../panes/BreadcrumbsOption';
import ButtonOption from '../panes/ButtonOption';
import CheckBoxOption from '../panes/CheckBoxOption';
import SelectOption from '../panes/SelectOption';
import InfoOption from '../panes/InfoOption';
import clone from 'clone';
import duplicateComponentTree from '../helpers/duplicateComponentTree';
import getSmartProp from '../helpers/getSmartProp';
import buildClipboardRepresentation from '../helpers/buildClipboardRepresentation';
import canParentTakeChild from '../helpers/canParentTakeChild';
// import restoreComponentTree from '../helpers/restoreComponentTree';
// import Package from '../base/Package';

const responsiveVisibilityClasses = [
  'visible-xs-block', 'visible-sm-block', 'visible-md-block', 'visible-lg-block',
  'visible-xs-inline', 'visible-sm-inline', 'visible-md-inline', 'visible-lg-inline',
  'visible-xs-inline-block', 'visible-sm-inline-block', 'visible-md-inline-block',
  'visible-lg-inline-block', 'hidden-xs', 'hidden-sm', 'hidden-md', 'hidden-lg'
];
const accessibilityClasses = ['show', 'hidden', 'sr-only'];

class Component extends Box {
  constructor() {
    super();
    this.parent = null;
    this.element = null;
    this.inline = false;
    this.flags = {
      canBeMoved: true,
      canBeDeleted: true,
      canBeDuplicated: true,
      canBeEdited: false,
      canBePackaged: true,
      canBeCopied: true
    };
    this.cssClasses = {
      system: '',
      parent: ''
    };
    this.overrides = {};
    this.attributes = {};
    this.attributesMask = {};
    this.properties = {};
    this.overrideBlacklist = [];
    this._instanceOptionGroups = [];
    this._instanceOptionProperties = [];
    this._instanceActions = [];
    this._dimensionsBeforeUpdate = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    this.defineActions([{
      label: 'Copy',
      action: this.copyAction.bind(this),
      visible: [this.flags, 'canBeCopied'],
      showInContextMenu: true,
      weight: 92
    }, {
      label: 'Copy to',
      options: this.getCopyToTargets.bind(this),
      visible: [this.flags, 'canBeCopied'],
      showInContextMenu: true,
      weight: 93
    }, {
      label: 'Add to Library',
      action: this.addToLibraryAction.bind(this),
      visible: [this.flags, 'canBePackaged'],
      showInContextMenu: true,
      showInApplicationMenu: true,
      weight: 95
    }, {
      label: 'Duplicate',
      icon: 'content_copy',
      action: this.duplicateAction.bind(this),
      visible: [this.flags, 'canBeDuplicated'],
      showInOptionsPane: true,
      showInContextMenu: true,
      showInApplicationMenu: true,
      accelerator: 'CmdOrCtrl+D',
      weight: 98
    }, {
      label: 'Delete',
      icon: 'delete',
      action: this.deleteAction.bind(this),
      visible: [this.flags, 'canBeDeleted'],
      showInOptionsPane: true,
      showInContextMenu: true,
      showInApplicationMenu: true,
      accelerator: 'Delete',
      weight: 99
    }, {
      label: 'More',
      icon: 'more_vert',
      action: this.libraryMenuClick.bind(this),
      visible: [this.flags, 'canBePackaged'],
      showInOptionsPane: true,
      weight: 100
    }]);
  }

  libraryMenuClick(e) {
    const elem = $(e.currentTarget);
    const offset = elem.offset();
    // const editable = elem.closest('.smart-editable');
    // const self = this;
    const items = [{
      name: 'Add to Library',
      action: this.addToLibraryAction.bind(this)
    }];
    app.contextMenu.show(offset.left + elem.outerWidth(), offset.top + elem.outerHeight(), items);
  }

  initialize() {}

  fixate() {
    this.flags.canBeMoved = false;
    this.flags.canBeDeleted = false;
    this.flags.canBeDuplicated = false;
    this.flags.canBePackaged = false;
    this.flags.canBeCopied = false;
  }

  freeze() {
    this.fixate();
    this.flags.canBeEdited = false;
  }

  isLocked() {
    return !this.flags.canBeMoved;
  }

  getName() {
    return this.constructor.getName();
  }

  getFullName() {
    return this.getName() + (this.id ? `#${this.id}` : '');
  }

  defineProperties(arr) {
    if (!Array.isArray(arr)) {
      arr = [arr];
    }
    for (let i = 0; i < arr.length; i++) {
      this.properties[arr[i].id] = arr[i].value;
      this._instanceOptionProperties.push(arr[i]);
    }
  }

  deleteProperties(arr) {
    if (!Array.isArray(arr)) {
      arr = [arr];
    }
    for (let i = 0; i < arr.length; i++) {
      let index = -1;
      for (let j = 0; j < this._instanceOptionProperties.length; j++) {
        if (arr[i] === this._instanceOptionProperties[j].id) {
          index = j;
          break;
        }
      }
      if (index >= 0) {
        this._instanceOptionProperties.splice(index, 1);
        delete this.properties[arr[i]];
      }
    }
  }

  defineGroups(arr) {
    if (!Array.isArray(arr)) {
      arr = [arr];
    }
    Array.prototype.push.apply(this._instanceOptionGroups, arr);
  }

  defineActions(arr) {
    if (!Array.isArray(arr)) {
      arr = [arr];
    }
    Array.prototype.push.apply(this._instanceActions, arr);
    this._instanceActions.sort((a, b) => (a.weight || 0) - (b.weight || 0));
  }

  getVisibleActions() {
    return this._instanceActions.filter(a => getSmartProp(a.visible, true));
  }

  getCopyToTargets() {
    if (!canParentTakeChild(app.context.page.html.body, this)) {
      return [];
    }
    const options = [];
    for (const page of app.context.pages.getAll()) {
      if (page === this.page()) continue;
      options.push({
        name: page.name,
        action: pageClick.bind(this, page)
      });
    }

    options.push({
      name: 'New Page',
      action: () => {
        const page = app.designPane.createNewPage();
        pageClick(page);
      }
    });

    const that = this;
    function pageClick(page) {
      page.html.body.insertWithHistory(that.clone(), 'Paste Component');
      return options;
    }
  }

  copyAction() {
    if (!this.flags.canBeCopied) return;
    const data = buildClipboardRepresentation(this);
    electron.clipboardSet(data.text, data.html);
  }

  addToLibraryAction() {
    const Package = require('../base/Package').default;
    app.componentToPackageDialog.open({
      component: this,
      onSubmit: obj => {
        const up = new Package;
        up.name = obj.name;
        up.css = obj.css.map(c => c.serialize());
        up.fonts = clone(obj.fonts);
        up.images = obj.images.map(img => img.serialize());
        up.components = this.serialize();

        app.removePackage(up);

        app.context.history.add({
          name: 'Add To Library',
          undo: () => app.addPackage(up),
          redo: () => app.removePackage(up)
        });
      }
    });
  }

  duplicateAction() {
    const parent = this.parent;
    const index = this.parent.childIndex(this) + 1;
    const cloned = duplicateComponentTree(this);
    parent.insertAt(cloned, index);
    setTimeout(() => parent.update(), 0);
    app.context.history.add({
      name: 'Duplicate Component',
      undo: () => {
        cloned.remove();
        parent.update();
      },
      redo: () => {
        parent.insertAt(cloned, index);
        parent.update();
      }
    });
  }

  deleteAction() {
    const parent = this.parent;
    const index = this.parent.childIndex(this);

    this.remove();
    parent.update();

    app.context.history.add({
      name: 'Delete Component',
      undo: () => {
        parent.insertAt(this, index);
        parent.update();
      },
      redo: () => {
        this.remove();
        parent.update();
      }
    });
  }

  updateID(newID = '', path = '/') {
    const status = this.isIDValid(newID, path);
    if (status !== 1) {
      return status;
    }
    this.setOverride(path, 'id', newID);
    return 1;
  }

  isIDValid(newID = '', path = '/') {
    newID = String(newID).trim();
    if (this.getOverride(path, 'id') === newID) return 1;
    if (!newID.length) {
      this.removeOverride(path, 'id');
      return 1;
    }
    if (/^[_-]|[^_a-zA-Z0-9-]/.test(newID)) return -2;
    try {
      if (app.canvas.isThereDOMNodeWithID(newID)) return -3;
    } catch (err) {
      return -2;
    }
    return 1;
  }

  setUniqueID() {
    const prefix = this.constructor.name.toLowerCase().replace(/[auoe]/g, '').slice(0, 6);
    return this.updateID(app.canvas.generateUniqueID(prefix));
  }

  context() {
    const page = this.page();
    if (!page) return;

    return page.context;
  }

  page() {
    if (this._page) return this._page;
    if (this.parent) {
      return (this._page = this.parent.page());
    }
  }

  hoverDrag(offset = 10) {
    if (this.parent) {
      return this.parent.hoverDrag(offset);
    }
    return false;
  }

  onDoubleClick() {
    return false;
  }

  /**
   * @param e
   */
  onMouseup() {
    return false;
  }

  onMousedown(e) {
    if (!this.isFocused()) {
      this.focus();
    }
    if (e.button === 2) {
      this.onRightClick();
      return;
    }
    const now = Date.now();
    if (this._lastClickTime && now - this._lastClickTime < 500) {
      this.onDoubleClick(e);
    } else {
      this._lastClickTime = now;
    }
  }

  onRightClick() {
    this.showContextMenu();
    if (!this.isFocused()) {
      this.focus();
    }
  }

  isChildElementBlacklisted(node) {
    const path = this.getPathForChildElement(node);
    if (!path) return false;

    for (const black of this.overrideBlacklist) {
      if (path === black || path.indexOf(black) === 0) {
        return true;
      }
    }

    return false;
  }

  findChildElementByPath(path) {
    let node = this.element[0];
    // const context = this.context();
    const page = this.page();
    let index;
    // let selector;
    const reg = /\/(\d*)/g;
    const indexRegex = /^\/(\d+)$/;
    const parsed = path.match(reg);

    if (parsed.length === 1 && parsed[0] === '/') return node;

    for (let i = 0; i < parsed.length; i++) {
      index = parsed[i].match(indexRegex)[1];
      // selector = null;
      if (!node.children || !node.children[index]) {
        return null;
      }
      if (page.domToComponent.has(node.children[index])) {
        return null;
      }
      node = node.children[index];
    }
    return node;
  }

  getPathForChildElement(element) {
    const comp = this.page().findComponentForElement(element);
    if (!comp || comp !== this) return null;

    const indexes = [];
    let current = 0;
    let node = element;

    while (true) {
      if (node === this.element[0] || !node) break;
      if (node.previousSibling) {
        node = node.previousSibling;
        current++;
      } else {
        indexes.unshift(current);
        current = 0;
        node = node.parentNode;
      }
    }
    return `/${indexes.join('/')}`;
  }

  showContextMenu() {
    if (!this.parent) return;
    const pos = app.mousePosition;
    const opt = this.getVisibleActions().filter(a => a.showInContextMenu);

    const options = [];
    for (const o of opt) {
      if (o.options) {
        options.push({
          name: o.label,
          options: getSmartProp(o.options, [])
        });
      } else {
        options.push({
          name: o.label,
          action: o.action
        });
      }
    }

    options.unshift({
      name: 'Select Parent',
      action: this.focusParent.bind(this)
    });

    options.unshift({
      name: this.getName(),
      type: 'heading'
    });

    app.contextMenu.show(pos.x, pos.y, options);
  }

  getMainOptionsGroup() {
    return app.optionsPane.getById(`${this.constructor.name.toLowerCase()}-options`);
  }

  isFocused() {
    return this.page().isFocused(this);
  }

  focusParent() {
    if (this.parent) {
      this.parent.focus();
    }
  }

  focusNextSibling() {
    if (this.parent) {
      const next = this.parent.findNextComponentChild(this);
      next && next.focus();
    }
  }

  focusPreviousSibling() {
    if (this.parent) {
      const prev = this.parent.findPreviousComponentChild(this);
      prev && prev.focus();
    }
  }

  focus() {
    const that = this;
    app.context.page.focusedComponent = this;
    app.context.page.focusedDOMNode = this.element[0];
    app.trigger('component-focused', this);
    app.optionsPane.empty();

    const infoOpt = new InfoOption({
      id: 'info-option',
      component: this
    });
    app.optionsPane.add(infoOpt);
    this.parent && this.parent.childFocus(this);

    const defaultGroup = new GroupOption({
      id: `${this.constructor.name.toLowerCase()}-options`,
      label: `${this.getName()} Options`
    });
    app.optionsPane.add(defaultGroup);

    let prop;
    let history;
    let item;
    for (let i = 0; i < this._instanceOptionGroups.length; i++) {
      prop = this._instanceOptionGroups[i];
      item = new GroupOption({
        id: prop.id,
        label: prop.label
      });
      app.optionsPane.add(item, prop.weight);
    }

    for (let i = 0; i < this._instanceOptionProperties.length; i++) {
      prop = this._instanceOptionProperties[i];
      history = prop.history;
      if (!history) {
        history = `Change ${this.getName()} ${prop.label}`;
        if (prop.type === 'checkbox') history += ' State';
      }
      item = null;
      switch (prop.type) {
        case 'checkbox':
          item = new CheckBoxOption({
            id: prop.id,
            label: prop.label,
            value: [this.properties, prop.id],
            visible: prop.visible,
            component: this,
            history
          });
          break;
        case 'textbox':
          item = new TextBoxOption({
            id: prop.id,
            label: prop.label,
            value: [this.properties, prop.id],
            visible: prop.visible,
            component: this,
            history
          });
          break;
        case 'select':
          item = new SelectOption({
            id: prop.id,
            label: prop.label,
            value: [this.properties, prop.id],
            visible: prop.visible,
            options: prop.options,
            component: this,
            history
          });
          break;
        default:
          throw new Error('Ivalid type');
      }

      if (prop.group) {
        app.optionsPane.getById(prop.group).add(item, prop.weight);
      } else {
        defaultGroup.add(item, prop.weight);
      }
    }
    app.optionsPane.add(new BreadcrumbsOption({
      component: this
    }), 0);

    const actionsGroup = new GroupOption({
      id: 'actions',
      label: ''
    });
    app.optionsPane.add(actionsGroup, 0);
    for (let i = 0; i < this._instanceActions.length; i++) {
      const obj = this._instanceActions[i];
      if (obj.showInOptionsPane) {
        actionsGroup.add(new ButtonOption({
          icon: obj.icon,
          text: obj.label,
          onClick: obj.action,
          visible: obj.visible
        }), obj.weight);
      }
    }

    const rv = new GroupOption({
      id: 'responsive-visibility',
      label: 'Responsive Visibility',
      collapsed: true
    });
    app.optionsPane.add(rv, 70);

    responsiveVisibilityClasses.forEach(cls => {
      rv.add(new CheckBoxOption({
        label: cls,
        value: [that.properties, cls],
        component: that,
        history: `Modify ${that.getName()} Visibility`
      }));
    });

    const acc = new GroupOption({
      id: 'accessibility',
      label: 'Accessibility',
      collapsed: true
    });
    app.optionsPane.add(acc, 80);
    accessibilityClasses.forEach(cls => {
      acc.add(new CheckBoxOption({
        label: cls,
        value: [that.properties, cls],
        component: that,
        history: `Modify ${that.getName()} Accessibility`
      }));
    });
  }

  getCSSClasses() {
    let systemClasses = '';
    if (typeof this.cssClasses.system === 'string') {
      systemClasses = this.cssClasses.system;
    } else {
      for (const k in this.cssClasses.system) {
        if (this.cssClasses.system.hasOwnProperty(k)) {
          systemClasses += `${this.cssClasses.system[k]} `;
        }
      }
    }
    return `${systemClasses} ${this.cssClasses.parent}`.trim().replace(/\s+/g, ' ');
  }

  getOverride(path, attribute, defaultValue = null) {
    attribute = attribute.toLowerCase();
    if (this.overrides.hasOwnProperty(path) && this.overrides[path].hasOwnProperty(attribute)) {
      return this.overrides[path][attribute];
    }
    return defaultValue;
  }

  getOverrides(path) {
    return this.overrides[path] || {};
  }

  setOverride(path, attribute, value) {
    attribute = attribute.toLowerCase();
    if (!this.overrides.hasOwnProperty(path)) {
      this.overrides[path] = {};
    }
    this.overrides[path][attribute] = value;
  }

  removeAllOverrides(path) {
    for (const key in this.overrides[path]) {
      delete this.overrides[path][key];
    }
  }

  setOverrides(path, obj) {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      this.setOverride(path, key, obj[key]);
    }
  }

  removeOverride(path, attribute) {
    attribute = attribute.toLowerCase();
    if (this.overrides.hasOwnProperty(path)) {
      delete this.overrides[path][attribute];
      if (!Object.keys(this.overrides).length) {
        delete this.overrides[path];
      }
    }
  }

  blur() {
    app.optionsPane.empty();
    app.context.page.focusedComponent = null;
    app.context.page.focusedDOMNode = null;
    this.onBlur();
  }

  onBlur() {
    app.trigger('component-blurred', this);
  }

  remove() {
    if (!this.parent) return;
    if (this.isFocused()) {
      if (this.page().isActive()) {
        this.parent.focus();
      } else {
        this.page().focusedComponent = this.parent;
      }
    }
    this.parent.removeChild(this);
  }

  replaceWithOperation(component) {
    const parent = this.parent;
    const index = this.parent.childIndex(this);
    const original = this;
    return {
      'do': () => {
        original.remove();
        parent.insertAt(component, index);
      },
      undo: () => {
        component.remove();
        parent.insertAt(original, index);
      }
    };
  }

  startDragging() {
    app.canvas.markAsDragged(this);
    app.overviewPane.markAsDragged(this);
  }

  stopDragging() {
    app.canvas.markAsNotDragged(this);
    app.overviewPane.markAsNotDragged(this);
  }

  afterDuplicate() {
    if (this.id) {
      const oldID = this.id;
      this.setUniqueID();
      app.changedIDMap[oldID] = this.id;
    }
  }

  isChildOf(component) {
    let parent = this;
    while (parent = parent.parent) {
      if (parent === component) {
        return true;
      }
    }
    return false;
  }

  hasParent(type) {
    let parent = this;
    while (parent = parent.parent) {
      if (parent instanceof type) {
        return true;
      }
    }
    return false;
  }

  hasChild() {
    return false;
  }

  update() {
    this.startUpdate();
    return this.finishUpdate();
  }

  startUpdate() {
    this.updateDimensionsBeforeUpdate();
    this.parent && this.parent.childUpdate(this);
    this.element.removeAttr('class');

    const cssClasses = this.getCSSClasses();
    if (cssClasses) {
      this.element.attr('class', cssClasses);
    }
    for (let i = 0; i < accessibilityClasses.length; i++) {
      const cls = accessibilityClasses[i];
      if (this.properties[cls]) {
        this.element[0].classList.add(cls);
      }
    }
    for (let i = 0; i < responsiveVisibilityClasses.length; i++) {
      const cls = responsiveVisibilityClasses[i];
      if (this.properties[cls]) {
        this.element[0].classList.add(cls);
      }
    }
  }

  finishUpdate() {
    const atts = [];
    for (let i = 0; i < this.element[0].attributes.length; i++) {
      atts.push(this.element[0].attributes[i].name);
    }
    for (let i = 0; i < atts.length; i++) {
      if (atts[i] === 'class') continue;
      if (!this.attributes.hasOwnProperty(atts[i])) {
        this.element[0].removeAttribute(atts[i]);
      }
    }
    for (const prop in this.attributes) {
      if (this.attributes.hasOwnProperty(prop)) {
        if (this.element[0].getAttribute(prop) !== this.attributes[prop]) {
          this.element[0].setAttribute(prop, this.attributes[prop]);
        }
      }
    }

    let value;
    let node;
    let tmp;
    const eventRegex = /^on.*$/i;

    for (const path in this.overrides) {
      for (const attr in this.overrides[path]) {
        value = this.overrides[path][attr];
        node = this.findChildElementByPath(path);
        if (!node) continue;
        if ((attr === 'class' || attr === 'id') && !value) {
          continue;
        }
        if (eventRegex.test(attr)) continue;
        if (attr === 'dir' || attr === 'contenteditable') continue;
        if (attr === 'class') {
          tmp = node.getAttribute('class');
          if (tmp) {
            value = `${tmp} ${value}`;
          }
          node.setAttribute('class', value.replace(/\s+/g, ' ').trim());
        } else {
          node.setAttribute(attr, value);
        }
      }
    }

    if (app.context.page.focusedComponent === this) {
      app.context.page.focusedDOMNode = this.element[0];
    }
    app.trigger('component-updated', this);
    return this.element;
  }

  updateDimensions() {
    const box = this.element[0].getBoundingClientRect();
    super.updateDimensions(box.left, box.top, box.width, box.height);
    app.trigger('component-dimensions-updated', this);
  }

  updateDimensionsBeforeUpdate() {
    this._dimensionsBeforeUpdate.width = this.width;
    this._dimensionsBeforeUpdate.height = this.height;
    this._dimensionsBeforeUpdate.x = this.x;
    this._dimensionsBeforeUpdate.y = this.y;
  }

  haveDimensionsChanged() {
    return this._dimensionsBeforeUpdate.width !== this.width
      || this._dimensionsBeforeUpdate.height !== this.height
      || this._dimensionsBeforeUpdate.x !== this.x
      || this._dimensionsBeforeUpdate.y !== this.y;
  }

  clone() {
    const restoreComponentTree = require('../helpers/restoreComponentTree').default;
    let cloned = restoreComponentTree(this.serialize());
    if (this.parent && this.parent.childClean) {
      cloned = this.parent.childClean(cloned);
    }
    return cloned;
  }

  serialize() {
    const obj = {};
    obj.class = this.constructor.name;
    obj.cssClasses = clone(this.cssClasses);
    obj.overrides = clone(this.overrides);
    obj.flags = clone(this.flags);
    obj.properties = clone(this.properties);
    return obj;
  }

  unserialize(obj) {
    if (obj.cssClasses) {
      this.cssClasses = clone(obj.cssClasses);
    }
    if (obj.overrides) {
      this.overrides = clone(obj.overrides);
    }
    if (obj.flags) {
      for (const k in obj.flags) {
        this.flags[k] = obj.flags[k];
      }
    }
    if (obj.properties) {
      this.properties = clone(obj.properties);
    }
  }

  canBeDroppedIn(component) {
    return component !== this && !component.isChildOf(this);
  }

  /**
   * @param component
   */
  canTakeChild() {
    return false;
  }

  isVisible() {
    return this.parent
      && this.x + this.width > 0
      && this.x < app.context.canvasDimensions.width
      && this.y + this.height > 0 && this.y < app.context.canvasDimensions.height
      && (this.width > 0 || this.height > 0);
  }

  static getName() {
    if (this.hasOwnProperty('prettyName')) return this.prettyName;
    return this.name;
  }
}

export default Component;
