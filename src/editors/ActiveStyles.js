import Editor from './Editor';
import prettyDOMNodeName from '../helpers/prettyDOMNodeName';
import normalizeCSSSelector from '../helpers/normalizeCSSSelector';
import escapeHTML from 'escape-html';
import CSSRule from '../base/CSSRule';
import CSSBlock from '../base/CSSBlock';
import cssProperties from '../config/css-properties';
import SuggestionTooltip from '../panes/SuggestionTooltip';
// import dragScroll from '../helpers/dragScroll';
import parseCSS from '../helpers/parseCSS';

class ActiveStyles extends Editor {
  constructor() {
    super('Steps');

    this.system = true;
    this.element = $(
      '\n			<div class="active-styles css-editor editor">' +
      '\n				<div class="toolbar">' +
      '\n					<a class="create button darkgray">Create</a>' +
      '<a class="create-choose button darkgray">&nbsp;</a>' +
      '\n				</div>' +
      '\n				<div class="content"></div>' +
      '\n				<div class="message">No Test Case Selected</div>' +
      '\n			</div>' +
      '\n		'
    );
    this.cssBlocks = [];
    this.blockMatchedSelectors = new WeakMap;
    this.focusOutTimeout = null;
    this.focus = null;
    this.pending = null;
    this.ignoreFocusout = false;
    this.mode = 'active-styles';
    this.targetCSSResource = null;
    this.domToCSSItem = new WeakMap;
    this.cssItemToDOM = new WeakMap;
    this.pageActivatedListener = this.pageActivated.bind(this);
    this.componentFocusedListener = this.componentFocused.bind(this);
    this.componentBlurredListener = this.componentBlurred.bind(this);
    this.componentUpdatedListener = this.componentUpdated.bind(this);
    this.contextCSSChangedListener = this.contextCSSChanged.bind(this);
    this.nodeFocusedListener = this.nodeFocused.bind(this);
    this.resourceChangedListener = this.resourceChanged.bind(this);
  }

  bindEventListeners() {
    super.bindEventListeners();

    const dom = this.element;
    dom.on('keydown', '[contenteditable]', this.onEditableKeydown.bind(this));
    dom.on('input', '[contenteditable]', this.onEditableInput.bind(this));
    dom.on('focusin', '[contenteditable]', this.onEditableFocus.bind(this));
    dom.on('focusout', '[contenteditable]', this.onEditableFocusout.bind(this));
    dom.on('mousedown', '.css-block.temp', this.clickTempBlock.bind(this));
    dom.on('mousedown', '.css-block:not(.system) .color', this.colorClick.bind(this));
    dom.on('mousedown', '.css-block:not(.system) .css-property', this.clickCSSProperty.bind(this));
    dom.on('mousedown', '.css-block:not(.system) .css-value', this.clickCSSValue.bind(this));
    dom.on('mousedown', '.css-block:not(.system) .selector', this.clickSelector.bind(this));
    dom.on('mousedown', '.css-block:not(.system) .media', this.clickMediaQuery.bind(this));
    dom.on('click', '.css-block:not(.system) .opening-brace', this.clickOpeningBrace.bind(this));
    dom.on('click', '.css-block:not(.system) .closing-brace', this.clickClosingBrace.bind(this));
    dom.on('click', '.css-block:not(.system) .rules li', this.clickCSSRule.bind(this));
    dom.on('click', '.menu', this.showContextMenu.bind(this));
    dom.on('change', 'input[type=checkbox]', this.checkBoxChange.bind(this));
    dom.on('click', '.button.create', this.clickCreateStyleButton.bind(this));
    dom.on('click', '.button.create-choose', this.clickCreateChooseStyleButton.bind(this));
    app.on('page-activated', this.pageActivatedListener);
    app.on('component-focused', this.componentFocusedListener);
    app.on('component-blurred', this.componentBlurredListener);
    app.on('component-updated', this.componentUpdatedListener);
    app.on('context-css-changed', this.contextCSSChangedListener);
    app.on('node-focused', this.nodeFocusedListener);
    app.on('resource-changed', this.resourceChangedListener);
  }

  unbindEventListeners() {
    super.unbindEventListeners();

    this.element.off();
    app.off('page-activated', this.pageActivatedListener);
    app.off('component-focused', this.componentFocusedListener);
    app.off('component-blurred', this.componentBlurredListener);
    app.off('component-updated', this.componentUpdatedListener);
    app.off('context-css-changed', this.contextCSSChangedListener);
    app.off('node-focused', this.nodeFocusedListener);
    app.off('resource-changed', this.resourceChangedListener);
  }

  deactivate() {
    super.deactivate();
    this.resetFocus();
  }

  resourceChanged(type, res) {
    if (type !== 'css') return;
    if (!Array.isArray(res)) {
      res = [res];
    }

    for (const css of res) {
      if (!app.context.hasResource(css) && this.targetCSSResource === css) {
        this.targetCSSResource = null;
        break;
      }
    }

    this.scheduleUpdate();
  }

  pageActivated() {
    this.scheduleUpdate();
  }

  nodeFocused() {
    this.scheduleUpdate();
  }

  /**
   * @param component
   */
  componentFocused() {
    this.handlePendingChanges();
    this.resetFocus();
    this.scheduleUpdate();
  }

  /**
   * @param component
   */
  componentBlurred() {
    this.handlePendingChanges();
    this.resetFocus();
    this.scheduleUpdate();
  }

  componentUpdated() {
    if (app.isInlineEditingActive()) return;
    this.handlePendingChanges();
    this.resetFocus();
    this.scheduleUpdate();
  }

  contextCSSChanged(context, block) {
    if (this.ignoreUpdatedEvent) return;
    if (block) {
      this.refreshBlock(block);
    } else {
      this.update();
    }
  }

  getTargetCSSResource() {
    if (this.targetCSSResource) {
      return this.targetCSSResource;
    }
    if (app.context.assets.css.length) {
      return app.context.assets.css.get(0);
    }
    return null;
  }

  clickCreateStyleButton() {
    const block = new CSSBlock(prettyDOMNodeName(app.context.page.focusedDOMNode));
    let cssResource = this.getTargetCSSResource();
    if (!cssResource) {
      cssResource = app.designPane.createNewCSSFile();
      this.targetCSSResource = cssResource;
    }
    const index = cssResource.blocks.length;
    this.focusNewBlockSelector(block, index);
    this.update();
  }

  clickCreateChooseStyleButton(e) {
    const options = [];

    for (const css of app.context.assets.css.getAll()) {
      options.push({
        name: css.name,
        action: styleClick.bind(this, css)
      });
    }

    options.push({
      name: 'New Stylesheet',
      action: () => {
        const style = app.designPane.createNewCSSFile();
        styleClick(style);
      }
    });

    const rect = e.target.getBoundingClientRect();
    app.contextMenu.show(rect.right - 10, rect.bottom - 10, options);

    const that = this;
    function styleClick(stylesheet) {
      that.targetCSSResource = stylesheet;
      that.clickCreateStyleButton();
    }
  }

  clickCSSProperty(e) {
    e.stopImmediatePropagation();

    const li = e.currentTarget.parentNode;
    const rule = this.domToCSSItem.get(li);
    if (this.isCSSPropertyFocused(rule)) return;
    e.preventDefault();

    const block = this.domToCSSItem.get(li.closest('.css-block'));
    if (!rule || !block) return;
    this.handlePendingChanges();
    this.refreshPreviouslyFocusedBlock();
    this.focusCSSProperty(block, rule);
    this.refreshBlock(block);
  }

  clickCSSValue(e) {
    e.stopImmediatePropagation();
    const li = e.currentTarget.parentNode;
    const rule = this.domToCSSItem.get(li);
    if (this.isCSSValueFocused(rule)) return;
    e.preventDefault();

    const block = this.domToCSSItem.get(li.closest('.css-block'));
    if (!rule || !block) return;
    this.handlePendingChanges();
    this.refreshPreviouslyFocusedBlock();
    this.focusCSSValue(block, rule);
    this.refreshBlock(block);
  }

  clickSelector(e) {
    e.stopImmediatePropagation();
    const block = this.domToCSSItem.get(e.currentTarget.closest('.css-block'));
    if (!block) return;
    if (this.isSelectorFocused(block)) return;
    e.preventDefault();
    this.handlePendingChanges();
    this.refreshPreviouslyFocusedBlock();
    this.focusBlockSelector(block);
    this.refreshBlock(block);
  }

  clickMediaQuery(e) {
    e.stopImmediatePropagation();
    const block = this.domToCSSItem.get(e.currentTarget.closest('.css-block'));
    if (!block) return;
    if (this.isMediaQueryFocused(block)) return;
    e.preventDefault();
    this.handlePendingChanges();
    this.refreshPreviouslyFocusedBlock();
    this.focusBlockMediaQuery(block);
    this.refreshBlock(block);
  }

  colorClick(e) {
    let li = e.currentTarget.closest('li');
    const rule = this.domToCSSItem.get(li);
    const block = this.domToCSSItem.get(e.currentTarget.closest('.css-block'));
    const before = rule.value.slice(0, e.currentTarget.dataset.start);
    const after = rule.value.slice(e.currentTarget.dataset.end);

    app.colorPicker.open({
      color: e.currentTarget.dataset.color,
      point: app.mousePosition,
      onChange: color => {
        this.setPendingChanges(before + color + after, {
          block,
          rule,
          type: 'value'
        });

        const tempRule = rule.clone();
        tempRule.value = before + color + after;

        const oldLi = li;
        li = this.renderRule(tempRule);
        $(oldLi).replaceWith(li);
      },
      onSelect: color => {
        this.updateRule(block, rule, rule.property, before + color + after);
        this.refreshBlock(block);
        this.resetPendingChanges();
      },
      onCancel: () => {
        this.resetPendingChanges();
        this.refreshBlock(block);
      }
    });
    e.preventDefault();
    return false;
  }

  clickTempBlock(e) {
    if (this.focus.type !== 'new-selector') return;
    if (e.target.closest('.selector')) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    this.handleNext(e.currentTarget.querySelector('.selector').textContent);
  }

  clickOpeningBrace(e) {
    if (!e.target.matches('.opening-brace')) return;
    e.stopImmediatePropagation();
    e.preventDefault();

    const block = this.domToCSSItem.get(e.currentTarget.closest('.css-block'));
    if (!block) return;
    this.focusNewCSSProperty(block, new CSSRule, 0);
    this.refreshBlock(block);
  }

  clickClosingBrace(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const block = this.domToCSSItem.get(e.currentTarget.closest('.css-block'));
    if (!block) return;

    const rule = new CSSRule;
    this.focusNewCSSProperty(block, rule, block.rules.length);
    this.refreshBlock(block);
  }

  clickCSSRule(e) {
    if (!e.target.matches('li')) return;
    e.stopImmediatePropagation();
    e.preventDefault();

    const li = e.currentTarget;
    const rule = this.domToCSSItem.get(li);
    const block = this.domToCSSItem.get(li.closest('.css-block'));
    if (!rule || !block) return;

    const index = block.rules.indexOf(rule);
    if (index === -1) return;

    this.focusNewCSSProperty(block, new CSSRule, index + 1);
    this.refreshBlock(block);
  }

  checkBoxChange(e) {
    e.stopImmediatePropagation();

    const li = e.target.closest('li');
    const rule = this.domToCSSItem.get(li);
    const block = this.domToCSSItem.get(li.closest('.css-block'));

    this.toggleRule(block, rule);
    this.refreshRule(rule);
  }

  onEditableKeydown(e) {
    // Up or Down
    if (e.which === 38 || e.which === 40) {
      const direction = e.which === 38 ? 1 : -1;
      if (/\d+/.test(e.target.textContent)) {
        this.saveCaretPosition();
        const oldLength = e.target.textContent.length;
        const caretOffset = window.getSelection().anchorOffset;
        const regex = /(-\d+\.\d+|\d+\.\d+|-\d+|\d+)(?:vw|vh|vmin|vmax|px|pt|pc|ex|em|rem|ch|cm|mm|in|\b)\b/g;
        e.target.textContent = e.target.textContent.replace(regex, (match, num, offset) => {
          if (caretOffset < offset || caretOffset > offset + match.length) {
            return match;
          }
          let numb = Number(num) + direction;
          const suffix = match.replace(num, '');
          if (e.shiftKey) {
            numb = Number(num) + direction * 10;
          } else if (e.altKey) {
            numb = (Number(num) * 10 + direction) / 10;
          }
          if (numb !== Math.round(numb)) {
            return numb.toFixed(1) + suffix;
          }
          return numb + suffix;
        });

        const newLength = e.target.textContent.length;
        this.setPendingChanges(e.target.textContent, this.focus);
        this.restoreCaretPosition(e.target.firstChild, newLength - oldLength);
        e.preventDefault();
      }
    }

    // Enter
    if (e.which === 13) {
      e.preventDefault();
      this.handleNext(e.target.textContent);
    }

    // Tab
    if (e.which === 9) {
      e.preventDefault();
      if (e.shiftKey) {
        this.handlePrevious(e.target.textContent);
      } else {
        this.handleNext(e.target.textContent);
      }
    }

    // ESC
    if (e.which === 27) {
      const focus = this.focus;
      this.ignoreFocusoutForABit();
      if (this.focus.type === 'new-selector') {
        this.resetFocus();
        this.update();
      } else {
        const block = focus.block;
        this.resetFocus();
        this.refreshBlock(block);
      }
      this.resetPendingChanges();
    }

    // Backspace
    if (e.which === 8 && this.focus.type === 'new-value' && e.target.textContent === '') {
      e.preventDefault();
      this.handlePrevious('');
    }
  }

  onEditableInput(e) {
    const focus = this.focus || {};
    const block = focus.block;
    const rule = focus.rule;
    const type = focus.type;

    this.saveCaretPosition();
    e.target.textContent = e.target.textContent;
    this.restoreCaretPosition(e.target.firstChild);
    this.setPendingChanges(e.target.textContent, this.focus);

    if (type === 'selector' || type === 'new-selector') {
      if (e.target.textContent.match(/\{.*\}$/)) {
        let cssBlocks = null;
        try {
          cssBlocks = parseCSS(e.target.textContent);
        } catch (err) {
          this.resetFocus();
          this.refreshBlock(block);
          return;
        }
        if (cssBlocks.length) {
          e.target.textContent = '';

          setTimeout(() => {
            this.insertBlocks(cssBlocks, focus.index);
            if (this.mode === 'css-editor') {
              const lastBlock = cssBlocks[cssBlocks.length - 1];
              this.focusCSSValue(lastBlock, lastBlock.rules[lastBlock.rules.length - 1]);
            } else {
              this.resetFocus();
            }
            this.update();
          }, 20);
        }
      }
      if (e.target.textContent.match(/\{\s*$/)) {
        return this.handleNext(e.target.textContent.trim().slice(0, -1));
      }
    }

    if (type === 'property' || type === 'new-property') {
      if (e.target.textContent.match(/\:\s*$/)) {
        return this.handleNext(e.target.textContent.trim().slice(0, -1));
      }

      const rules = quickParseRules(e.target.textContent);
      if (rules.length) {
        e.target.textContent = '';
        setTimeout(() => {
          let index = focus.index;
          if (type === 'property') {
            index = block.rules.indexOf(rule);
            this.deleteRule(block, rule);
          }
          this.insertRules(block, rules, index);
          this.focusNewCSSProperty(block, new CSSRule, index + rules.length);
          this.refreshBlock(block);
        }, 20);
      }
    }

    if (type === 'value' || type === 'new-value') {
      if (e.target.textContent.match(/\;\s*$/)) {
        return this.handleNext(e.target.textContent.trim().slice(0, -1));
      }
    }
  }

  onEditableFocus(e) {
    const block = this.domToCSSItem.get(e.target.closest('.css-block'));
    if (!block) return;

    if (this.focusOutTimeout) {
      clearTimeout(this.focusOutTimeout);
    }

    this.resetPendingChanges();
    const focus = this.focus || {};
    const rule = focus.rule;

    if (focus.type === 'property' || focus.type === 'new-property') {
      this.activeTooltip = new SuggestionTooltip($(e.target), {
        condition: /^([\w-]+)$/i,
        items: cssProperties.validProperties
      }, {
        onSelect: val => {
          this.setPendingChanges(val, focus);
        }
      });
    }
    if (focus.type === 'value' || focus.type === 'new-value') {
      if (cssProperties.validProperties.indexOf(rule.property) === -1) {
        return;
      }

      let cssPropertySuggestions = ['initial', 'inherit'];
      if (cssProperties.propertyValues.hasOwnProperty(rule.property.toLowerCase())) {
        cssPropertySuggestions =
          cssPropertySuggestions.concat(cssProperties.propertyValues[rule.property.toLowerCase()]);

        if (rule.property.toLowerCase() === 'font-family') {
          Array.prototype.unshift.apply(cssPropertySuggestions, app.context.getFonts().map(f =>
            `'${f.name}'`
          ));
        }
      }
      this.activeTooltip = new SuggestionTooltip($(e.target), [{
        condition: /^([\w-]*)$/i,
        items: cssPropertySuggestions
      }, {
        condition: /url\(['"]?([\w-\.]*)$/i,
        items: () => app.context.assets.images.getAll().map(i => i.name)
      }], {
        onSelect: val => {
          this.setPendingChanges(val, focus);
        }
      });

      if (e.target.textContent.trim().length === 0) {
        this.activeTooltip.update();
      }
    }
  }

  /**
   * @param e
   */
  onEditableFocusout() {
    if (this.activeTooltip) {
      this.activeTooltip.destroy();
      this.activeTooltip = null;
    }
    if (this.ignoreFocusout) return;
    if (this.focusOutTimeout) {
      clearTimeout(this.focusOutTimeout);
    }

    this.focusOutTimeout = setTimeout(() => {
      this.handlePendingChanges();

      const block = this.focus && this.focus.block;
      this.resetFocus();
      this.update();
      if (block) {
        this.scrollToBlock(block);
      }
    }, 20);
  }

  ignoreFocusoutForABit() {
    this.ignoreFocusout = true;
    setTimeout(() => {
      this.ignoreFocusout = false;
    }, 50);
  }

  isRuleFocused(rule) {
    return this.focus && this.focus.rule === rule;
  }

  isCSSPropertyFocused(rule) {
    return this.isRuleFocused(rule)
      && (this.focus.type === 'property' || this.focus.type === 'new-property');
  }

  isCSSValueFocused(rule) {
    return this.isRuleFocused(rule)
      && (this.focus.type === 'value' || this.focus.type === 'new-value');
  }

  isBlockFocused(block) {
    return this.focus
      && this.focus.block === block;
  }

  isSelectorFocused(block) {
    return this.isBlockFocused(block)
      && (this.focus.type === 'selector' || this.focus.type === 'new-selector');
  }

  isMediaQueryFocused(block) {
    return this.isBlockFocused(block) && this.focus.type === 'mediaquery';
  }

  focusBlockSelector(block) {
    const resource = app.context.findResourceForCSSBlock(block);
    const index = resource.findIndexForCSSBlock(block);
    this.focus = {
      block,
      type: 'selector',
      index
    };
  }

  focusNewBlockSelector(block, index) {
    this.focus = {
      block,
      type: 'new-selector',
      index
    };
  }

  focusBlockMediaQuery(block) {
    this.focus = {
      block,
      type: 'mediaquery'
    };
  }

  focusCSSProperty(block, rule) {
    this.focus = {
      block,
      rule,
      type: 'property'
    };
  }

  focusCSSValue(block, rule) {
    this.focus = {
      block,
      rule,
      type: 'value'
    };
  }

  focusNewCSSProperty(block, rule, index) {
    this.focus = {
      block,
      rule,
      type: 'new-property',
      index
    };
  }

  focusNewCSSValue(block, rule, index) {
    this.focus = {
      block,
      rule,
      type: 'new-value',
      index
    };
  }

  resetFocus() {
    this.focus = null;
  }

  setPendingChanges(value, pointer) {
    this.pending = {
      value,
      pointer
    };

    let tmpRule;
    if (pointer.type === 'property' || pointer.type === 'new-property') {
      tmpRule = pointer.rule.clone();
      tmpRule.property = value;
    }

    if (pointer.type === 'value' || pointer.type === 'new-value') {
      tmpRule = pointer.rule.clone();
      tmpRule.value = value;
    }

    if (!tmpRule || !tmpRule.isValid()) return;

    const tmpBlock = pointer.block.clone();
    tmpBlock.rules = [tmpRule];
    app.trigger('css-pending-changes-set', tmpBlock);
  }

  resetPendingChanges() {
    this.pending = null;
    app.trigger('css-pending-changes-reset');
  }

  handlePendingChanges() {
    if (!this.pending) return;
    this.commitFieldChanges(this.pending.value, this.pending.pointer);
    this.resetPendingChanges();
  }

  refreshPreviouslyFocusedBlock() {
    if (!this.focus) return;
    const oldBlock = this.focus.block;
    setTimeout(() => {
      if (this.focus && oldBlock !== this.focus.block) {
        this.refreshBlock(oldBlock);
      }
    }, 10);
  }

  commitFieldChanges(val, pointer) {
    val = val.trim();

    const block = pointer.block;
    const rule = pointer.rule;
    switch (pointer.type) {
      case 'selector':
        if (val.length) {
          this.updateSelector(block, val);
        } else {
          this.deleteBlock(block);
        }
        break;
      case 'new-selector':
        if (val.length) {
          block.selector = val;
          this.insertBlock(block, pointer.index);
        }
        break;
      case 'mediaquery':
        if (val.length) {
          this.updateMediaQuery(block, val);
        } else {
          this.updateMediaQuery(block, false);
        }
        break;
      case 'property':
        if (val.length) {
          this.updateRule(block, rule, val, rule.value);
        } else {
          this.deleteRule(block, rule);
        }
        break;
      case 'new-property':
        break;
      case 'value':
        if (val.length) {
          this.updateRule(block, rule, rule.property, val);
        } else {
          this.deleteRule(block, rule);
        }
        break;
      case 'new-value':
        if (val.length) {
          rule.value = val;
          this.insertRule(block, rule, pointer.index);
        } else {
          this.deleteRule(block, rule);
        }
        break;
    }
  }

  handleNext(val = '') {
    this.ignoreFocusoutForABit();
    this.resetPendingChanges();

    val = val.trim();

    const block = this.focus.block;
    const rule = this.focus.rule;
    let nextRule;

    switch (this.focus.type) {
      case 'selector':
        if (val.length) {
          this.updateSelector(block, val);
          if (block.rules.length) {
            this.focusCSSProperty(block, block.rules[0]);
          } else {
            this.focusNewCSSProperty(block, new CSSRule, 0);
          }
          this.refreshBlock(block);
        } else {
          const nextBlock = this.getNextBlock(block);
          this.deleteBlock(block);
          if (nextBlock) {
            this.focusBlockSelector(nextBlock);
          } else {
            this.resetFocus();
          }
          this.update();
        }
        break;
      case 'new-selector':
        if (val.length) {
          block.selector = val;
          this.insertBlock(block, this.focus.index);
          this.focusNewCSSProperty(block, new CSSRule, 0);
          this.refreshBlock(block);
        } else {
          this.resetFocus();
          this.update();
        }
        break;
      case 'mediaquery':
        if (val.length) {
          this.updateMediaQuery(block, val);
        } else {
          this.updateMediaQuery(block, false);
        }
        this.resetFocus();
        this.refreshBlock(block);
        break;
      case 'property':
        if (val.length) {
          this.updateRule(block, rule, val, rule.value);
          this.focusCSSValue(block, rule);
        } else {
          nextRule = this.getNextRule(block, rule);
          const previousRule = this.getPreviousRule(block, rule);
          this.deleteRule(block, rule);
          if (nextRule) {
            this.focusCSSProperty(block, nextRule);
          } else if (previousRule) {
            this.focusCSSProperty(block, previousRule);
          } else {
            this.resetFocus();
          }
        }
        this.refreshBlock(block);
        break;
      case 'new-property':
        if (val.length) {
          rule.property = val;
          this.focusNewCSSValue(block, rule, this.focus.index);
        } else {
          nextRule = null;
          if (this.focus.index === 0) {
            nextRule = block.rules[0];
          } else {
            nextRule = this.getNextRule(block, this.focus.index - 1);
          }
          const nextBlock = this.getNextBlock(block);
          if (nextRule) {
            this.focusCSSProperty(block, nextRule);
          } else if (nextBlock) {
            this.focusBlockSelector(nextBlock);
            this.refreshBlock(nextBlock);
          } else {
            this.resetFocus();
          }
        }
        this.refreshBlock(block);
        break;
      case 'value':
        let ruleIndex = block.rules.indexOf(rule);
        if (val.length) {
          this.updateRule(block, rule, rule.property, val);
          ruleIndex++;
        } else {
          this.deleteRule(block, rule);
        }
        nextRule = this.getNextRule(block, rule);
        if (nextRule) {
          this.focusCSSProperty(block, nextRule);
        } else {
          this.focusNewCSSProperty(block, new CSSRule, ruleIndex);
        }
        this.refreshBlock(block);
        break;
      case 'new-value':
        let index = this.focus.index;
        if (val.length) {
          rule.value = val;
          this.insertRule(block, rule, this.focus.index);
          nextRule = this.getNextRule(block, rule);
          index++;
        } else {
          nextRule = block.rules[index];
        }

        if (nextRule) {
          this.focusCSSProperty(block, nextRule);
        } else {
          this.focusNewCSSProperty(block, new CSSRule, index);
        }
        this.refreshBlock(block);
        break;
    }
  }

  handlePrevious(val = '') {
    this.ignoreFocusoutForABit();
    this.resetPendingChanges();
    val = val.trim();

    const block = this.focus.block;
    const rule = this.focus.rule;
    let previousRule;

    switch (this.focus.type) {
      case 'selector':
        const previousBlock = this.getPreviousBlock(block);
        if (val.length) {
          this.updateSelector(block, val);
        } else {
          this.deleteBlock(block);
        }
        if (previousBlock) {
          if (previousBlock.rules.length) {
            this.focusCSSValue(previousBlock, previousBlock.rules[previousBlock.rules.length - 1]);
          } else {
            this.focusBlockSelector(previousBlock);
          }
          this.refreshBlock(previousBlock);
        } else {
          this.resetFocus();
        }
        if (val.length) {
          this.refreshBlock(block);
        } else {
          this.update();
        }
        break;
      case 'new-selector':
        if (val.length) {
          block.selector = val;
          this.insertBlock(block, this.focus.index);
          this.resetFocus();
          this.refreshBlock(block);
        } else {
          this.resetFocus();
          this.update();
        }
        break;
      case 'mediaquery':
        if (val.length) {
          this.updateMediaQuery(block, val);
        } else {
          this.updateMediaQuery(block, false);
        }
        this.resetFocus();
        this.refreshBlock(block);
        break;
      case 'property':
        previousRule = this.getPreviousRule(block, rule);
        if (val.length) {
          this.updateRule(block, rule, val, rule.value);
        } else {
          this.deleteRule(block, rule);
        }
        if (previousRule) {
          this.focusCSSValue(block, previousRule);
        } else {
          this.focusBlockSelector(block);
        }
        this.refreshBlock(block);
        break;
      case 'new-property':
        if (val.length) {
          rule.property = val;
          if (rule.value.trim().length) {
            this.insertRule(block, rule, this.focus.index);
          }
        }
        previousRule = this.getPreviousRule(block, this.focus.index);
        if (previousRule) {
          this.focusCSSValue(block, previousRule);
        } else {
          this.focusBlockSelector(block);
        }
        this.refreshBlock(block);
        break;
      case 'value':
        if (val.length) {
          this.updateRule(block, rule, rule.property, val);
          this.focusCSSProperty(block, rule);
        } else {
          previousRule = this.getPreviousRule(block, rule);
          if (previousRule) {
            this.focusCSSValue(block, previousRule);
          } else {
            this.focusBlockSelector(block);
          }
          this.deleteRule(block, rule);
        }
        this.refreshBlock(block);
        break;
      case 'new-value':
        rule.value = val;
        this.focusNewCSSProperty(block, rule, this.focus.index);
        this.refreshBlock(block);
        break;
    }
  }

  getNextRule(block, current) {
    let index = current;
    if (current instanceof CSSRule) {
      index = block.rules.indexOf(current);
    }
    if (index < 0) return null;
    if (block.rules[index + 1]) return block.rules[index + 1];
    return null;
  }

  getPreviousRule(block, current) {
    let index = current;
    if (current instanceof CSSRule) {
      index = block.rules.indexOf(current);
    }
    if (index > 0) return block.rules[index - 1];
    return null;
  }

  getNextBlock(block) {
    const index = this.cssBlocks.indexOf(block);
    if (index === -1) return null;

    const nextBlock = this.cssBlocks[index + 1];
    if (!nextBlock) return null;
    if (nextBlock.system) return null;
    return nextBlock;
  }

  getPreviousBlock(block) {
    const index = this.cssBlocks.indexOf(block);
    if (index < 1) return null;

    const previousBlock = this.cssBlocks[index - 1];
    if (previousBlock.system) return null;
    return previousBlock;
  }

  insertRules(block, rules, index, history = 'Add CSS Rules') {
    const oldRules = block.rules.slice();
    block.addAtIndex(rules, index);

    const newRules = block.rules.slice();
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context, block);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: history,
      undo: () => {
        block.rules = oldRules;
        app.trigger('context-css-changed', app.context, block);
      },
      redo: () => {
        block.rules = newRules;
        app.trigger('context-css-changed', app.context, block);
      }
    });
  }

  insertRule(block, rule, index) {
    this.insertRules(block, rule, index, 'Add CSS Rule');
  }

  updateRule(block, rule, newProperty, newValue) {
    const oldProperty = rule.property;
    const oldValue = rule.value;
    if (newProperty === oldProperty && newValue === oldValue) return;

    rule.property = newProperty;
    rule.value = newValue;
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context, block);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Change CSS Rule',
      undo: () => {
        rule.property = oldProperty;
        rule.value = oldValue;
        app.trigger('context-css-changed', app.context, block);
      },
      redo: () => {
        rule.property = newProperty;
        rule.value = newValue;
        app.trigger('context-css-changed', app.context, block);
      }
    });
  }

  deleteRule(block, rule) {
    const oldRules = block.rules.slice();
    block.removeRule(rule);

    const newRules = block.rules.slice();
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context, block);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Delete CSS Rule',
      undo: () => {
        block.rules = oldRules;
        app.trigger('context-css-changed', app.context, block);
      },
      redo: () => {
        block.rules = newRules;
        app.trigger('context-css-changed', app.context, block);
      }
    });
  }

  insertBlock(block, index) {
    const css = this.getTargetCSSResource();

    css.addCSSBlockAtIndex(block, index);
    if (this.mode === 'active-styles') {
      this.cssBlocks.unshift(block);
    }
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Create CSS Block',
      undo: () => {
        css.deleteCSSBlock(block);
        app.trigger('context-css-changed', app.context);
      },
      redo: () => {
        css.addCSSBlockAtIndex(block, index);
        app.trigger('context-css-changed', app.context);
      }
    });
  }

  insertBlocks(blocks, index) {
    const css = this.getTargetCSSResource();
    const oldCSS = css.blocks.slice();

    css.addCSSBlocksAtIndex(blocks, index);

    const newCSS = css.blocks.slice();
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Create CSS Block',
      undo: () => {
        css.blocks = oldCSS;
        app.trigger('context-css-changed', app.context);
      },
      redo: () => {
        css.blocks = newCSS;
        app.trigger('context-css-changed', app.context);
      }
    });
  }

  deleteBlock(block) {
    const css = app.context.assets.css.findResourceForBlock(block);
    if (!css) return;

    const index = css.findIndexForCSSBlock(block);
    css.deleteCSSBlock(block);
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Delete CSS Block',
      undo: () => {
        css.addCSSBlockAtIndex(block, index);
        app.trigger('context-css-changed', app.context);
      },
      redo: () => {
        css.deleteCSSBlock(block);
        app.trigger('context-css-changed', app.context);
      }
    });
  }

  updateSelector(block, newSelector) {
    const oldSelector = block.selector;
    if (newSelector === oldSelector) return;

    block.selector = newSelector;
    this.refreshBlockMatchedSelectors(block);

    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context, block);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Update CSS Selector',
      undo: () => {
        block.selector = oldSelector;
        this.refreshBlockMatchedSelectors(block);
        app.trigger('context-css-changed', app.context, block);
      },
      redo: () => {
        block.selector = newSelector;
        this.refreshBlockMatchedSelectors(block);
        app.trigger('context-css-changed', app.context, block);
      }
    });
  }

  refreshBlockMatchedSelectors(block) {
    if (this.mode !== 'active-styles') return;
    if (!app.context.page.focusedDOMNode) return;
    const result = block.calculateSpecificityFor(app.context.page.focusedDOMNode);
    this.blockMatchedSelectors.set(block, result.selectors || []);
  }

  updateMediaQuery(block, newMediaQuery) {
    const oldMediaQuery = block.mediaQuery;
    if (newMediaQuery === oldMediaQuery) return;

    block.mediaQuery = newMediaQuery;
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context, block);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Update Media Query',
      undo: () => {
        block.mediaQuery = oldMediaQuery;
        app.trigger('context-css-changed', app.context, block);
      },
      redo: () => {
        block.mediaQuery = newMediaQuery;
        app.trigger('context-css-changed', app.context, block);
      }
    });
  }

  toggleRule(block, rule, status = 'toggle') {
    const oldStatus = rule.enabled;
    let newStatus = !oldStatus;

    if (status !== 'toggle') {
      newStatus = status;
    }

    if (newStatus === oldStatus) return;
    rule.enabled = newStatus;
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context, block);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Toggle CSS Rule',
      undo: () => {
        rule.enabled = oldStatus;
        app.trigger('context-css-changed', app.context, block);
      },
      redo: () => {
        rule.enabled = newStatus;
        app.trigger('context-css-changed', app.context, block);
      }
    });
  }

  refreshBlock(block) {
    const node = this.cssItemToDOM.get(block);
    if (!node) return;
    if (!app.context.assets.css.findResourceForBlock(block)) {
      if (node.parentNode) node.parentNode.removeChild(node);
      return;
    }

    const newNode = this.renderBlock(block);
    $(node).replaceWith(newNode);
    this.focusContentEditable(newNode);
  }

  refreshRule(rule) {
    const node = this.cssItemToDOM.get(rule);
    if (!node) return;

    const newNode = this.renderRule(rule);
    $(node).replaceWith(newNode);
    this.focusContentEditable(newNode);
  }

  focusContentEditable(node) {
    const elem = node.querySelector('[contenteditable]');
    if (!elem) return;

    elem.focus();
    this.selectContents(elem);
    elem.scrollIntoViewIfNeeded();
  }

  scrollToBlock(block) {
    const node = this.cssItemToDOM.get(block);
    if (!node) return;

    node.scrollIntoViewIfNeeded();
  }

  renderGroup(group) {
    if (!group.blocks.length) {
      return document.createDocumentFragment();
    }

    const elem = document.createElement('div');
    elem.classList.add('css-group');

    if (group.inherited) {
      const tmp = document.createElement('div');
      tmp.classList.add('inherit-label');
      tmp.textContent = `Inherited from ${group.inheritedFrom}`;
      elem.appendChild(tmp);
    }

    if (group.pseudo) {
      const tmp = document.createElement('div');
      tmp.classList.add('inherit-label');
      tmp.textContent = ':before and :after elements';
      elem.appendChild(tmp);
    }

    const blocks = group.blocks.map(this.renderBlock.bind(this));
    for (let i = 0; i < blocks.length; i++) {
      elem.appendChild(blocks[i]);
    }

    this.domToCSSItem.set(elem, group);
    return elem;
  }

  renderBlock(block) {
    const elem = document.createElement('div');
    elem.classList.add('css-block');
    const focus = this.focus || {};
    const thisIsTempBlock = focus.block === block && focus.type === 'new-selector';
    if (thisIsTempBlock) {
      elem.classList.add('temp');
    }

    const selector = document.createElement('span');
    if (this.mode === 'active-styles' && this.blockMatchedSelectors.has(block)) {
      selector.innerHTML = formatSelector(block.selector, this.blockMatchedSelectors.get(block));
    } else {
      if (block.selector.length) {
        selector.innerHTML = `<b>${escapeHTML(block.selector)}</b>`;
      } else {
        selector.textContent = '';
      }
    }

    if (this.mode === 'css-editor' && !thisIsTempBlock) {
      const handle = document.createElement('span');
      handle.classList.add('handle');
      elem.appendChild(handle);
    }

    selector.classList.add('selector');
    if (focus.block === block && (focus.type === 'selector' || focus.type === 'new-selector')) {
      selector.contentEditable = true;
      selector.spellcheck = false;
    }
    if (block.system) {
      elem.classList.add('system');
    }

    let media;
    if (block.mediaQuery === false) {
      media = document.createDocumentFragment();
    } else {
      media = document.createElement('p');
      media.classList.add('media');
      media.textContent = '@media ';

      const mSpan = document.createElement('span');
      mSpan.textContent = block.mediaQuery;
      media.appendChild(mSpan);
      if (focus.block === block && focus.type === 'mediaquery') {
        mSpan.contentEditable = true;
        mSpan.spellcheck = false;
      } else {
        if (!block.isMediaQueryValid()) {
          media.classList.add('error');
        }
      }
    }

    const menu = document.createElement('div');
    menu.classList.add('menu');
    menu.innerHTML = '<span></span>';

    const openingBrace = document.createElement('p');
    openingBrace.classList.add('opening-brace');
    openingBrace.appendChild(selector);
    openingBrace.appendChild(document.createTextNode(' {'));

    const closingBrace = document.createElement('p');
    closingBrace.classList.add('closing-brace');
    closingBrace.textContent = '}';

    const origin = document.createElement('div');
    origin.classList.add('origin');
    if (block.system) {
      origin.textContent = 'Bootstrap';
      origin.innerHTML = `<i class="material-icon">lock_outline</i> ${origin.innerHTML}`;
      origin.title = 'Locked. Copy to edit.';
    } else {
      const res = app.context.findResourceForCSSBlock(block);
      if (res) {
        origin.textContent = res.name;
      }
    }

    const ul = document.createElement('ul');
    ul.classList.add('rules');

    const rules = block.rules.map(this.renderRule.bind(this));
    for (let i = 0; i < rules.length; i++) {
      ul.appendChild(rules[i]);
    }
    if (!thisIsTempBlock) {
      elem.appendChild(menu);
    }

    elem.appendChild(media);
    elem.appendChild(openingBrace);
    elem.appendChild(ul);
    elem.appendChild(closingBrace);
    elem.appendChild(origin);

    if (focus.block === block && (focus.type === 'new-value' || focus.type === 'new-property')) {
      const newRule = this.renderRule(focus.rule);
      newRule.classList.add('placeholder');
      ul.insertBefore(newRule, ul.children[focus.index]);
    }
    this.domToCSSItem.set(elem, block);
    this.cssItemToDOM.set(block, elem);

    return elem;
  }

  renderRule(rule) {
    const focus = this.focus || {};
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.tabIndex = -1;
    checkbox.checked = true;

    const propertySpan = document.createElement('span');
    propertySpan.textContent = rule.property;
    propertySpan.classList.add('css-property');

    const valueSpan = document.createElement('span');
    valueSpan.textContent = rule.value;
    valueSpan.classList.add('css-value');

    const spacer = document.createElement('i');
    spacer.textContent = ': ';
    spacer.classList.add('spacer');

    const semi = document.createElement('span');
    semi.textContent = ';';
    if (this.isRuleFocused(rule)) {
      if (focus.type === 'property' || focus.type === 'new-property') {
        propertySpan.contentEditable = true;
        propertySpan.spellcheck = false;
      } else {
        valueSpan.contentEditable = true;
        valueSpan.spellcheck = false;
      }
    } else {
      if (rule.system) {
        li.classList.add('system');
      }
      if (!rule.enabled) {
        li.classList.add('disabled');
        checkbox.checked = false;
      }
      if (!rule.isValid()) {
        li.classList.add('error');
      }
    }

    if (!(this.isRuleFocused(rule) && (focus.type === 'value' || focus.type === 'new-value'))
      && rule.isColorRelated()) {
      const matches = rule.extractColors();
      const children = [];
      let last = 0;

      for (const c of matches) {
        children.push(document.createTextNode(rule.value.slice(last, c.index)));
        last = c.index;
        const colorSpan = document.createElement('span');
        colorSpan.classList.add('color');
        colorSpan.dataset.color = c.match;
        colorSpan.dataset.start = c.index;
        colorSpan.dataset.end = c.index + c.match.length;
        const i = document.createElement('i');
        i.style.backgroundColor = c.match;
        colorSpan.appendChild(i);
        children.push(colorSpan);
      }

      children.push(document.createTextNode(rule.value.slice(last)));
      if (children.length > 1) {
        valueSpan.textContent = '';

        for (const c of children) {
          valueSpan.appendChild(c);
        }
      }
    }

    li.appendChild(checkbox);
    li.appendChild(propertySpan);
    li.appendChild(spacer);
    li.appendChild(valueSpan);
    li.appendChild(semi);

    this.domToCSSItem.set(li, rule);
    this.cssItemToDOM.set(rule, li);

    return li;
  }

  saveCaretPosition() {
    this.sel = window.getSelection();
    this.cursor_offset = this.sel.baseOffset;
  }

  restoreCaretPosition(element, change = 0) {
    if (!element) return;

    const range = window.getSelection().getRangeAt(0);
    this.cursor_offset = Math.min(this.cursor_offset + change, element.textContent.length + change);
    range.setStart(element, this.cursor_offset);
    range.collapse(true);
    this.sel.removeAllRanges();
    this.sel.addRange(range);
  }

  selectContents(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  duplicateBlockMenuAction(block) {
    const resource = app.context.assets.css.findResourceForBlock(block);
    if (!resource) return;

    const index = resource.findIndexForCSSBlock(block);
    return this.genericCopyBlockToCSSResource(resource, block, index + 1, 'Duplicate CSS Block');
  }

  copyBlockMenuAction(resource, block) {
    return this.genericCopyBlockToCSSResource(resource, block, resource.blocks.length,
      'Copy CSS Block');
  }

  /**
   * @param resource
   * @param block
   * @param index
   * @param title
   */
  genericCopyBlockToCSSResource(resource, block, index) {
    let clone;
    if (block.system) {
      clone = block.cloneAsUserBlock();
    } else {
      clone = block.clone();
    }

    resource.blocks.splice(index, 0, clone);
    app.trigger('context-css-changed', app.context);

    app.context.history.add({
      name: 'Duplicate CSS Block',
      undo: () => {
        resource.blocks.splice(index, 1);
        app.trigger('context-css-changed', app.context);
      },
      redo: () => {
        resource.blocks.splice(index, 0, clone);
        app.trigger('context-css-changed', app.context);
      }
    });
  }

  toggleMediaQueryMenuAction(block) {
    let query = false;
    const oldQuery = block.mediaQuery;
    const maxWidth = app.canvas.getBreakpointsForSize().max;
    const minWidth = app.canvas.getBreakpointsForSize().min;

    if (block.mediaQuery) {
      query = false;
    } else if (maxWidth === Infinity) {
      query = `(min-width:${minWidth}px)`;
    } else {
      query = `(max-width:${maxWidth}px)`;
    }

    block.mediaQuery = query;
    this.refreshBlock(block);
    this.ignoreUpdatedEvent = true;

    app.trigger('context-css-changed', app.context);
    this.ignoreUpdatedEvent = false;

    app.context.history.add({
      name: 'Toggle CSS Media Query',
      undo: () => {
        block.mediaQuery = oldQuery;
        app.trigger('context-css-changed', app.context);
      },
      redo: () => {
        block.mediaQuery = query;
        app.trigger('context-css-changed', app.context);
      }
    });
  }

  deleteBlockMenuAction(block) {
    this.deleteBlock(block);
    this.update();
  }

  showContextMenu(e) {
    const menu = $(e.target).closest('.menu');
    const block = this.domToCSSItem.get(menu.closest('.css-block')[0]);
    const top = menu.offset().top;
    const left = menu.offset().left + menu.width();
    const copyTargets = [];
    let resourceForBlock = null;
    if (!block.system) {
      resourceForBlock = app.context.findResourceForCSSBlock(block);
    }

    for (const css of app.context.assets.css.getAll()) {
      if (resourceForBlock === css) {
        continue;
      }
      copyTargets.push({
        name: css.name,
        action: copyTo.bind(this, css)
      });
    }

    copyTargets.push({
      name: 'New Stylesheet',
      action: () => {
        const style = app.designPane.createNewCSSFile();
        copyTo(style);
      }
    });

    const options = [{
      name: 'Copy to',
      options: copyTargets
    }];

    if (!block.system) {
      options.push({
        name: 'Duplicate',
        action: this.duplicateBlockMenuAction.bind(this, block)
      });

      let mq = 'Add Media Query';
      if (block.mediaQuery !== false) {
        mq = 'Remove Media Query';
      }
      options.push({
        name: mq,
        action: this.toggleMediaQueryMenuAction.bind(this, block)
      }, {
        name: 'Delete',
        action: this.deleteBlockMenuAction.bind(this, block)
      });
    }
    app.contextMenu.show(left, top, options, {
      preferLeft: true
    });

    const that = this;
    function copyTo(resource) {
      that.copyBlockMenuAction(resource, block);
    }
  }

  update() {
    const content = this.element.find('.content');
    const message = this.element.find('.message');
    const toolbar = this.element.find('.toolbar');

    if (app.context.page.focusedDOMNode) {
      content.show();
      toolbar.show();
      message.hide();
    } else {
      content.hide().empty();
      toolbar.hide();
      message.show();
      return;
    }

    const allBlocks = new Set;
    let result;
    const pseudoBlocks = [];
    let cssItem;
    const blockWeight = new WeakMap;
    let onlyPseudo;
    const pseudoRegex = /:before|:after/;
    let element = app.context.page.focusedDOMNode;

    this.cssGroups = [];
    this.cssBlocks = [];

    if (!element) {
      return this.element;
    }

    if (!app.canvas.contains(app.context.page.focusedDOMNode)) {
      return this.element;
    }

    const combinedCSS = app.context.getAllCSS();
    while (element.nodeType !== Node.DOCUMENT_NODE) {
      cssItem = {
        blocks: [],
        inherited: app.context.page.focusedDOMNode !== element,
        inheritedFrom: prettyDOMNodeName(element)
      };

      for (let i = 0; i < combinedCSS.length; i++) {
        if (allBlocks.has(combinedCSS[i])) continue;
        if (!combinedCSS[i].matchesElement(element)) continue;
        result = combinedCSS[i].calculateSpecificityFor(element);
        if (result) {
          if (cssItem.inherited && !combinedCSS[i].isInheritable()) {
            continue;
          }
          combinedCSS[i].cleanEmptyRules();
          blockWeight.set(combinedCSS[i], result.specificity);
          allBlocks.add(combinedCSS[i]);
          this.blockMatchedSelectors.set(combinedCSS[i], result.selectors);
          onlyPseudo = true;

          for (let j = 0; j < result.selectors.length; j++) {
            if (!pseudoRegex.test(result.selectors[j].selector)) {
              onlyPseudo = false;
              break;
            }
          }

          if (onlyPseudo) {
            pseudoBlocks.push(combinedCSS[i]);
          } else {
            cssItem.blocks.push(combinedCSS[i]);
          }
        }
      }

      if (cssItem.blocks.length) {
        cssItem.blocks.sort((a, b) => {
          if (a.isUserEmpty()) return -1;
          if (b.isUserEmpty()) return 1;
          if (blockWeight.get(b) === blockWeight.get(a)) {
            if (a.system && !b.system) return 1;
            if (!a.system && b.system) return -1;
            return 0;
          }
          return blockWeight.get(b) - blockWeight.get(a);
        });

        this.cssGroups.push(cssItem);
        this.cssBlocks.push(...cssItem.blocks);
      }
      element = element.parentNode;
    }

    if (this.focus && this.focus.type === 'new-selector') {
      if (this.cssGroups.length) {
        this.cssGroups[0].blocks.unshift(this.focus.block);
      }
    }

    if (pseudoBlocks.length) {
      this.cssGroups.push({
        blocks: pseudoBlocks,
        pseudo: true
      });
    }
    const groups = this.cssGroups.map(this.renderGroup.bind(this));
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < groups.length; i++) {
      fragment.appendChild(groups[i]);
    }
    content.empty();
    content.append(fragment);
    this.focusContentEditable(content[0]);

    return this.element;
  }
}

function formatSelector(selector, matches) {
  selector = selector.replace(/([^,]+),? ?/g, (full, select) => {
    select = normalizeCSSSelector(select);
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].selector === select) {
        return `_b_${full}_/b_`;
      }
    }
    return full;
  });

  return escapeHTML(selector).replace(/_b_/g, '<b>').replace(/_\/b_/g, '</b>');
}

function quickParseRules(value) {
  if (!/[^:]+:[^;]+;?/.test(value)) return [];
  const rules = value.match(/[^:]+:[^;]+;?/g).map(rule => {
    const tmp = rule.match(/([^:]+):([^;]+);?/);
    return new CSSRule(tmp[1].trim(), tmp[2].trim());
  }).filter(rule => !CSSRule.isPropertyForbidden(rule.property));
  return rules;
}

export default ActiveStyles;
