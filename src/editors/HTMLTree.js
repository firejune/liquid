import Editor from './Editor';
import parseDOMTree from '../helpers/parseDOMTree';
import getHTMLForNode from '../helpers/getHTMLForNode';
import componentTreeToArray from '../helpers/componentTreeToArray';
import clone from 'clone';
import deepEqual from 'deep-equal';
import ButtonOption from '../panes/ButtonOption';
import TextBoxOption from '../panes/TextBoxOption';
import TextBoxLockedContentOption from '../panes/TextBoxLockedContentOption';
import DoubleTextBoxOption from '../panes/DoubleTextBoxOption';
import GroupOption from '../panes/GroupOption';
import LinkOption from '../panes/LinkOption';

class HTMLTree extends Editor {
  constructor() {
    super('Layout');

    this.system = true;
    this.element = $(
      '\n			<div class="html-tree editor">' +
      '\n				<div class="content"></div>' +
      '\n				<div class="handle horizontal" data-reverse="1" data-min="100" data-max="500"' +
      ' data-target="#editor-pane .html-tree .attribute-panel"></div>' +
      '\n				<div class="attribute-panel"></div>' +
      '\n			</div>' +
      '\n		'
    );

    this.domTree = this.element.find('.content');
    this.treeElementToDOM = new WeakMap;
    this.domToTreeElement = new WeakMap;
    this.componentToTreeElement = new WeakMap;
    this.expandedElementsMap = new WeakMap;
    this.attributesGroup = new GroupOption({
      id: 'attributes'
    });
    this.attributesPanel = this.element.find('.attribute-panel');
    this.attributesPanel.append(this.attributesGroup.update());
    this.attributesPanelHandle = this.element.find('.html-column .html .handle');

    this.componentFocusedListener = this.componentFocused.bind(this);
    this.componentUpdatedListener = this.componentUpdated.bind(this);
    this.componentBlurredListener = this.componentBlurred.bind(this);
  }

  bindEventListeners() {
    super.bindEventListeners();

    const dom = this.element;
    dom.on('mousedown', '> .content b', this.mouseDownItem.bind(this));
    dom.on('mousedown', '> .content div > .close-tag', this.mouseDownItem.bind(this));
    dom.on('mousedown', '> .content i', this.arrowClick.bind(this));
    dom.on('mouseenter', '> .content b', this.enterItem.bind(this));
    dom.on('mouseenter', '> .content div > .close-tag', this.enterItem.bind(this));
    dom.on('mouseleave', '> .content b', this.leaveItem.bind(this));
    dom.on('mouseleave', '> .content div > .close-tag', this.leaveItem.bind(this));

    app.on('component-focused', this.componentFocusedListener);
    app.on('component-updated', this.componentUpdatedListener);
    app.on('component-blurred', this.componentBlurredListener);
  }

  unbindEventListeners() {
    super.unbindEventListeners();

    this.element.off();
    app.off('component-focused', this.componentFocusedListener);
    app.off('component-updated', this.componentUpdatedListener);
    app.off('component-blurred', this.componentBlurredListener);
  }

  /**
   * @param component
   */
  componentFocused() {
    this.hideAttributesForm();
    this.markFocusedTreeElement();
  }

  /**
   * @param component
   */
  componentBlurred() {
    this.markFocusedTreeElement();
  }

  /**
   * @param component
   */
  componentUpdated() {
    if (app.isInlineEditingActive()) return;
    this.scheduleUpdate();
  }

  enterItem(e) {
    const element = this.treeElementToDOM.get(e.currentTarget)
      || this.treeElementToDOM.get(e.currentTarget.parentNode);

    if (element) {
      app.canvas.highlightDOMElement(element);
    }
  }

  /**
   * @param e
   */
  leaveItem() {
    app.canvas.removeDOMHighlight();
  }

  copyNodeAsHTML(node) {
    const html = getHTMLForNode(node, app.context.page);
    electron.clipboardSet(html, html);
  }

  showAttributesForm(node) {
    const that = this;

    this.unmarkTreeElements('highlighted');
    this.markTreeElement(node, 'highlighted');

    const component = app.context.page.findComponentForElement(node);
    const path = component.getPathForChildElement(node);

    this.attributesGroup.empty();

    const idField = new TextBoxOption({
      label: 'ID',
      value: component.getOverride(path, 'id'),
      onEnter: saveAttributes,
      onEscape: cancelAttributeEditing
    });

    const classField = new TextBoxLockedContentOption({
      label: 'Class Names',
      lockedContent: component.getCSSClasses(),
      value: component.getOverride(path, 'class'),
      onEnter: saveAttributes,
      onEscape: cancelAttributeEditing
    });
    this.attributesGroup.add(idField);
    this.attributesGroup.add(classField);

    const overridesGroup = new GroupOption({
      id: 'overrides-group'
    });
    this.attributesGroup.add(overridesGroup);

    const fields = [];
    const overrides = component.getOverrides(path);
    for (const key in overrides) {
      if (key === 'id' || key === 'class') {
        continue;
      }
      fields.push(new DoubleTextBoxOption({
        key,
        value: overrides[key],
        onEnter: saveAttributes,
        onEscape: cancelAttributeEditing,
        onDelete: deleteAttribute
      }));
    }

    if (fields.length) {
      for (const f of fields) {
        overridesGroup.add(f);
      }
    }

    const controlGroup = new GroupOption({
      id: 'control-group'
    });

    controlGroup.add(new ButtonOption({
      text: 'Save',
      onClick: saveAttributes
    }));

    controlGroup.add(new LinkOption({
      text: 'Cancel',
      onClick: () => {
        this.hideAttributesForm();
      }
    }));

    controlGroup.add(new ButtonOption({
      text: 'Add Attribute',
      icon: 'add',
      onClick: () => {
        const tmp = new DoubleTextBoxOption({
          key: '',
          value: '',
          onEnter: saveAttributes,
          onEscape: cancelAttributeEditing,
          onDelete: deleteAttribute
        });

        overridesGroup.element.append(tmp.update());
        overridesGroup.show();
        fields.push(tmp);

        tmp.element.find('input:first').focus();
      }
    }));

    this.attributesGroup.add(controlGroup);
    this.attributesGroup.update();
    this.attributesPanel.show();
    this.attributesPanelHandle.show();
    this.element.find('.attributes input:first').focus();

    function saveAttributes() {
      const oldOverrides = clone(component.getOverrides(path));
      const newOverrides = {};
      newOverrides.id = oldOverrides.id;
      if (component.isIDValid(idField.val().trim()) === 1) {
        newOverrides.id = idField.val().trim();
      }
      newOverrides.class = classField.val().trim().replace(/\s+/g, ' ');

      for (const textBox of fields) {
        const tmp = textBox.val();
        const key = tmp.key.trim().toLowerCase();
        let val = tmp.value.trim();

        if (key === 'id' && component.isIDValid(val) !== 1) {
          val = oldOverrides.id;
        }
        if (!key) continue;
        newOverrides[key] = val;
      }

      if (newOverrides.class === '') {
        delete newOverrides.class;
      }

      if (newOverrides.id === '') {
        delete newOverrides.id;
      }

      if (deepEqual(oldOverrides, newOverrides)) {
        that.hideAttributesForm();
        return;
      }

      component.removeAllOverrides(path);
      component.setOverrides(path, newOverrides);
      component.update();
      app.context.history.add({
        name: 'Change Element Attributes',
        undo: () => {
          component.removeAllOverrides(path);
          component.setOverrides(path, oldOverrides);
          component.update();
        },
        redo: () => {
          component.removeAllOverrides(path);
          component.setOverrides(path, newOverrides);
          component.update();
        }
      });
    }

    function deleteAttribute(textBox) {
      const index = fields.indexOf(textBox);
      fields.splice(index, 1);
      textBox.element.remove();
    }

    function cancelAttributeEditing() {
      that.hideAttributesForm();
    }
  }

  hideAttributesForm() {
    this.attributesGroup.empty();
    this.unmarkTreeElements('highlighted');
    this.attributesGroup.update();
    this.attributesPanel.hide();
    this.attributesPanelHandle.hide();
  }

  mouseDownItem(e) {
    if (e.target.nodeType === 'I') {
      return;
    }
    const element = this.treeElementToDOM.get(e.currentTarget)
      || this.treeElementToDOM.get(e.currentTarget.parentNode);

    if (!element) return false;

    const component = app.context.page.findComponentForElement(element);
    if (e.button === 2) {
      const items = [];
      if (!component.isChildElementBlacklisted(element)) {
        items.push({
          name: 'Edit Attributes',
          action: this.showAttributesForm.bind(this, element)
        });
      }
      items.push({
        name: 'Copy As HTML',
        action: this.copyNodeAsHTML.bind(this, element)
      });
      app.contextMenu.show(e.pageX, e.pageY, items);
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    if (component && !component.isFocused()) {
      component.focus();
    }

    this.setFocusedDOMNode(element);
    this.markFocusedTreeElement();
  }

  setFocusedDOMNode(node) {
    app.context.page.focusedDOMNode = node;
    app.trigger('node-focused');
  }

  markFocusedTreeElement() {
    this.unmarkTreeElements('focused');
    if (!app.context.page.focusedDOMNode) return;

    const element = app.context.page.focusedDOMNode;
    this.markTreeElement(element, 'focused');
    this.expandAllToElement(element);
    this.scrollTreeElementIntoView(element);
  }

  scrollTreeElementIntoView(element) {
    const span = this.domToTreeElement.get(element);
    if (!span) return;
    span.scrollIntoViewIfNeeded();
  }

  markTreeElement(element, cls) {
    const span = this.domToTreeElement.get(element);
    if (!span) return;

    span.lastChild.classList.add(cls);
    if (span.nextSibling && span.nextSibling.matches('div')) {
      span.nextSibling.lastChild.classList.add(cls);
    }
  }

  unmarkTreeElements(cls) {
    this.element.find(`.${cls}`).removeClass(cls);
  }

  expandAllToElement(element, updateExpandedMap = true) {
    const span = this.domToTreeElement.get(element);
    const parents = $(span).parentsUntil(this.domTree, 'div').show();
    const spans = parents.prev('span');

    spans.children('i').addClass('down');
    spans.children('b').addClass('expanded');

    if (updateExpandedMap) {
      const that = this;
      spans.each(function() {
        that.updateExpandedState(this, true);
      });
    }
  }

  arrowClick(e) {
    const span = e.target.parentNode;
    this.expandContract(span);
    this.updateExpandedState(span, span.lastChild.classList.contains('expanded'));
  }

  updateExpandedState(element, newState = true) {
    const domElem = this.treeElementToDOM.get(element);
    if (!domElem) return;

    const comp = app.context.page.findComponentForElement(domElem);
    if (!comp) return;

    const path = comp.getPathForChildElement(domElem);
    if (!path) return;
    if (!this.expandedElementsMap.has(comp)) {
      this.expandedElementsMap.set(comp, {});
    }

    this.expandedElementsMap.get(comp)[path] = newState;
  }

  expandContract(treeElement, state = 'toggle') {
    const span = $(treeElement);
    const i = span.children('i');
    const b = span.children('b');
    if (!span.next('div').length) {
      return;
    }

    if (state === 'toggle') {
      span.next('div').slideToggle(100);
      i.toggleClass('down');
      b.toggleClass('expanded');
    } else {
      span.next('div')[state ? 'show' : 'hide']();
      i.toggleClass('down', state);
      b.toggleClass('expanded', state);
    }
  }

  update() {
    const root = document.createDocumentFragment();
    const map = this.treeElementToDOM;
    const reverseMap = this.domToTreeElement;
    const treeMap = this.componentToTreeElement;
    const scrollTop = this.element[0].scrollTop;
    const parsed = parseDOMTree(app.context.page.html.element[0], app.context.page, {
      removeSystemElements: true
    });
    walk(parsed, root);

    function walk(item, tip) {
      const tmp = document.createElement('span');
      const b = document.createElement('b');
      const em = document.createElement('em');
      b.appendChild(createOpenTag(item));
      b.appendChild(em);
      b.appendChild(createCloseTag(item));

      map.set(tmp, item.element);
      reverseMap.set(item.element, tmp);
      if (app.context.page.domToComponent.has(item.element)) {
        treeMap.set(app.context.page.domToComponent.get(item.element), tmp);
      }

      tmp.appendChild(b);
      tip.appendChild(tmp);

      if (item.children.length === 1 && typeof item.children[0] === 'string') {
        em.appendChild(document.createTextNode(item.children[0]));
      } else if (item.children.length) {
        em.appendChild(document.createTextNode('...'));
        const div = document.createElement('div');
        for (let i = 0; i < item.children.length; i++) {
          if (typeof item.children[i] === 'string') {
            stringToTextNode(item.children[i], div);
            continue;
          }
          walk(item.children[i], div);
        }
        const expandedClosingTag = createCloseTag(item);
        map.set(expandedClosingTag, item.element);
        div.appendChild(expandedClosingTag);
        tip.appendChild(div);
        tmp.insertBefore(document.createElement('i'), b);
      }
    }

    function stringToTextNode(str, node) {
      if (!str || !str.trim().length) return;
      const tmpSpan = document.createElement('span');
      const tmpB = document.createElement('b');
      tmpB.appendChild(document.createTextNode(`'${str}'`));
      tmpSpan.appendChild(tmpB);
      node.appendChild(tmpSpan);
    }

    function createOpenTag(item) {
      const strong = document.createElement('strong');
      strong.classList.add('open-tag');
      strong.appendChild(document.createTextNode(`<${item.tag}`));
      const attr = Array.from(item.attributes);
      let isID = false;
      for (let i = 0; i < attr.length; i++) {
        if (attr[i].name === 'id') {
          const tmp = attr[0];
          attr[0] = attr[i];
          attr[i] = tmp;
          isID = true;
          break;
        }
      }

      for (let i = 0; i < attr.length; i++) {
        if (attr[i].name === 'class') {
          if (isID) {
            const tmp = attr[1];
            attr[1] = attr[i];
            attr[i] = tmp;
          } else {
            const tmp = attr[0];
            attr[0] = attr[i];
            attr[i] = tmp;
          }
          break;
        }
      }

      for (let i = 0; i < attr.length; i++) {
        let tmp = document.createElement('attr-name');
        if (attr[i].value) {
          tmp.appendChild(document.createTextNode(` ${attr[i].name}=`));
          strong.appendChild(tmp);
          tmp = document.createElement('attr-value');
          tmp.appendChild(document.createTextNode(`'${attr[i].value}'`));
          strong.appendChild(tmp);
        } else {
          tmp.appendChild(document.createTextNode(` ${attr[i].name}`));
          strong.appendChild(tmp);
        }
      }

      if (item.selfclosing) {
        strong.appendChild(document.createTextNode(' /'));
      }

      strong.appendChild(document.createTextNode('>'));
      return strong;
    }

    function createCloseTag(item) {
      if (item.selfclosing) {
        return document.createDocumentFragment();
      }

      const strong = document.createElement('strong');
      strong.classList.add('close-tag');
      strong.appendChild(document.createTextNode(`</${item.tag}>`));

      return strong;
    }

    this.domTree.html(root);

    const components = componentTreeToArray(app.context.page.html);

    for (const comp of components) {
      if (this.expandedElementsMap.has(comp)) {
        for (const path in this.expandedElementsMap.get(comp)) {
          const span = this.domToTreeElement.get(comp.findChildElementByPath(path));
          if (!span) continue;
          this.expandContract(span, this.expandedElementsMap.get(comp)[path]);
        }
      }
    }

    this.markFocusedTreeElement();
    this.hideAttributesForm();
    this.element[0].scrollTop = scrollTop;
    return this.element;
  }
}

export default HTMLTree;
