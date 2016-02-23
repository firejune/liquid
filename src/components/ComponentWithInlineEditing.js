import ComponentWithChildren from './ComponentWithChildren';
import Component from './Component';
import InlineWrapper from './InlineWrapper';
import InlineCharacter from './InlineCharacter';
import inlineToHTML from '../helpers/inlineToHTML';
import inlineToDOM from '../helpers/inlineToDOM';
import inlineCompare from '../helpers/inlineCompare';
import htmlToInline from '../helpers/htmlToInline';
import htmlToText from '../helpers/htmlToText';
import canParentTakeChild from '../helpers/canParentTakeChild';
// import ButtonOption from '../panes/ButtonOption';
import keyChecker from '../helpers/keyChecker';

export default class ComponentWithInlineEditing extends ComponentWithChildren {
  constructor(content) {
    super();
    if (content) {
      this.children = htmlToInline(content);
    }
    this.element = $();
    this.flags.canBeEdited = true;
    this.caretIndex = 0;
    this.isInlineEditingActivated = false;
    this.caretPosition = 'before';
    this._numberOfClicks = 1;
    this._lastClickedCharIndex = 0;
    this.contextCache = new WeakMap;
    this.blacklist = [];
    this.defineActions({
      label: 'Edit',
      icon: 'edit',
      visible: this.isLargeEnoughForEditor.bind(this),
      action: this.activateInlineEditingAndMoveCaretToEnd.bind(this),
      showInOptionsPane: true,
      showInContextMenu: true,
      showInApplicationMenu: true
    });
  }

  initialize(str = 'Text') {
    this.children = htmlToInline(str);
  }

  setContent(str) {
    this.children = htmlToInline(str);
  }

  /**
   * @param content
   */
  getContent() {
    return inlineToHTML(this.children);
  }

  isLargeEnoughForEditor() {
    return this.isVisible() && this.height > 8;
  }

  childIndex(child) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof InlineWrapper && this.children[i].component === child) {
        return i;
      }
    }
    return -1;
  }

  findFirstComponentChild() {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof InlineWrapper) {
        return this.children[i].component;
      }
    }
    return false;
  }

  findNextComponentChild(current) {
    const currentIndex = this.childIndex(current);
    for (let i = currentIndex + 1; i < this.children.length; i++) {
      if (this.children[i] instanceof InlineWrapper) {
        return this.children[i].component;
      }
    }
    return false;
  }

  findPreviousComponentChild(current) {
    const currentIndex = this.childIndex(current);
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (this.children[i] instanceof InlineWrapper) {
        return this.children[i].component;
      }
    }
    return false;
  }

  findWrapperForComponent(component) {
    if (!component instanceof Component) return false;
    return this.children[this.childIndex(component)] || false;
  }

  copyChildrenFrom(other) {
    this.children.length = 0;
    this.children.push.apply(this.children, other.children.map(c => c.clone()));
  }

  showContextMenu() {
    if (this.isInlineEditingActivated) {
      return false;
    }
    super.showContextMenu();
  }

  isChildElementBlacklisted(node) {
    return node !== this.element[0];
  }

  hoverDrag(offset = 0) {
    if (!canParentTakeChild(this, app.draggedComponent)) {
      return this.parent && this.parent.hoverDrag(offset);
    }

    if (!this.isPointWithinOffset(app.canvas.mousePosition, offset) && this.parent) {
      return this.parent.hoverDrag(offset);
    }

    app.canvas.highlight(this);
    app.dropCall = {
      object: this,
      method: null,
      arguments: null
    };

    const index = this.children.indexOf(app.context.page.hoveredInlineElement);
    offset = 0;

    if (app.draggedComponent.isChildOf(this)) {
      const childIndex = this.childIndex(app.draggedComponent);
      if (childIndex <= index || index === -1) {
        offset = -1;
      }
    }

    if (app.context.page.hoveredInlineElement && index !== -1) {
      const characterOffset = app.context.page.hoveredInlineElement.element.offset();
      const characterWidth = app.context.page.hoveredInlineElement.element.outerWidth();
      const characterHeight = app.context.page.hoveredInlineElement.element.outerHeight();
      if (characterOffset.left + characterWidth / 2 >= app.canvas.mousePosition.x) {
        app.dropCall.method = 'insertAt';
        app.dropCall.arguments = [app.draggedComponent, index + offset];
        app.canvas.drawVerticalLine(characterOffset.left, characterOffset.top, characterHeight);
      } else {
        app.dropCall.method = 'insertAt';
        app.dropCall.arguments = [app.draggedComponent, index + 1 + offset];
        app.canvas.drawVerticalLine(characterOffset.left + characterWidth, characterOffset.top,
          characterHeight);
      }
    } else {
      app.dropCall.method = 'insertAt';
      app.dropCall.arguments = [app.draggedComponent, this.children.length + offset];
    }
    return true;
  }

  drop(component) {
    if (component instanceof InlineWrapper || component instanceof InlineCharacter) {
      return component;
    }
    this.adoptChild(component);
    return new InlineWrapper(component);
  }

  undrop(component) {
    return this.findWrapperForComponent(component) || component;
  }

  insertAt(component, index) {
    const result = super.insertAt(component, index);
    if (result && index - 1 > 0) {
      const wrapper = this.children[index];
      wrapper.copyStyles(this.children[index - 1]);
    }
    return result;
  }

  canTakeChild(child) {
    return !!child.inline;
  }

  hasChild(type) {
    for (let i = 0; i < this.children.length; i++) {
      if (!(this.children[i] instanceof InlineWrapper)) {
        continue;
      }
      if (this.children[i].component instanceof type) return true;
      if (this.children[i].component.hasChild(type)) return true;
    }
    return false;
  }

  onDoubleClick() {
    if (!this.flags.canBeEdited) return false;
    if (!this.isInlineEditingActivated) {
      this.placeCaretNearClosestElement();
      this.activateInlineEditing();
      app.inlineEditingBar.matchCharacterStyles(this.children[this.caretIndex]);
    }
  }

  onBlur() {
    super.onBlur();
    this.commit();
  }

  placeCaretNearClosestElement() {
    if (app.context.page.hoveredInlineElement) {
      [this.caretPosition, this.caretIndex] = this.hoveredInlineElementToPosition();
    }
  }

  hoveredInlineElementToPosition() {
    const index = this.children.indexOf(app.context.page.hoveredInlineElement);
    if (index === -1) {
      return ['before', 0];
    }

    app.context.page.hoveredInlineElement.updateDimensionsIfNeeded();
    const characterOffset = app.context.page.hoveredInlineElement.element.offset();
    const characterWidth = app.context.page.hoveredInlineElement.element.outerWidth();

    if (characterOffset.left + characterWidth / 2 >= app.canvas.mousePosition.x) {
      if (this.isFirstOfLine(index)) {
        return ['before', index];
      }
      return ['after', this.findPrevious(index)];
    }
    return ['after', index];
  }

  onMousedown(e) {
    super.onMousedown(e);

    if (this.isInlineEditingActivated) {
      const resetClicks = () => {
        this._numberOfClicks = 1;
        this._lastClickedCharIndex = -1;
      };
      this.placeCaretNearClosestElement();

      const startIndex = this.caretIndex;
      const startPosition = this.caretPosition;

      if (app.context.page.hoveredInlineElement && this._lastClickedCharIndex === this.caretIndex) {
        this._numberOfClicks++;
      } else {
        resetClicks();
        this._lastClickedCharIndex = this.caretIndex;
      }

      if (this.children[this.caretIndex]) {
        if (this._numberOfClicks === 1) {
          this.clearSelection();
          app.inlineEditingBar.matchCharacterStyles(this.children[this.caretIndex]);
          this.drawCaret();
        } else if (this._numberOfClicks === 2) {
          const [closestStart, closestEnd] = this.findBoundariesOfCurrentWord(this.caretIndex);
          this.makeSelection(closestStart, closestEnd);
        } else if (this._numberOfClicks >= 3) {
          this.selectEntireLine();
        }
      }

      clearTimeout(this._clickTimeout);
      this._clickTimeout = setTimeout(resetClicks, 400);

      app.on('mousemove.inline-editing', () => {
        if (!this.isPointWithin(app.canvas.mousePosition)) return;

        [this.caretPosition, this.caretIndex] = this.hoveredInlineElementToPosition();

        const [start, end] =
          this.rangeToIndexes(startIndex, startPosition, this.caretIndex, this.caretPosition);

        this.makeSelection(start, end);
      });

      app.on('mouseup.inline-editing', () => {
        app.off('.inline-editing');
      });
    }
  }

  selectEntireLine() {
    const startOfLine = this.findStartOfLine(this.caretIndex);
    const endOfLine = this.findEndOfLine(this.caretIndex);
    if (startOfLine !== false && endOfLine !== false) {
      this.makeSelection(startOfLine, endOfLine);
    }
  }

  selectAll() {
    if (this.children.length) {
      this.makeSelection(0, this.children.length - 1);
    }
  }

  keydownHandler(e) {
    const oldCaretIndex = this.caretIndex;
    const oldCaretPosition = this.caretPosition;

    let movement = false;
    const self = this;

    // Up or Down
    if (e.which === 38 || e.which === 40) {
      if (shouldClearSelection()) {
        const selection = this.getSelection();
        if (e.which === 38) {
          this.caretPosition = selection.startPosition;
          this.caretIndex = selection.startIndex;
        } else {
          this.caretPosition = selection.endPosition;
          this.caretIndex = selection.endIndex;
        }
        this.clearSelection();
      }

      let elements = null;
      if (e.which === 38) {
        elements = this.findPreviousLine(this.caretIndex);
      } else {
        elements = this.findNextLine(this.caretIndex);
      }

      if (elements !== false) {
        const currentLeftOffset = this.calcCaretPosition().left;
        let min = Infinity;
        let closestElement = null;

        for (let i = 0; i < elements.length; i++) {
          if (Math.abs(currentLeftOffset - (elements[i].x + elements[i].width / 2)) < min) {
            min = Math.abs(currentLeftOffset - (elements[i].x + elements[i].width / 2));
            closestElement = elements[i];
          }
        }

        if (currentLeftOffset < closestElement.x + closestElement.width / 2) {
          if (closestElement === elements[0]) {
            this.caretIndex = this.children.indexOf(closestElement);
            this.caretPosition = 'before';
          } else {
            this.caretIndex = this.children.indexOf(closestElement) - 1;
            this.caretPosition = 'after';
          }
        } else {
          this.caretIndex = this.children.indexOf(closestElement);
          this.caretPosition = 'after';
        }
        movement = true;
      }
      e.preventDefault();

    // Left
    } else if (e.which === 37 && !e.metaKey) {
      if (shouldClearSelection()) {
        const selection = this.getSelection();
        this.caretPosition = selection.startPosition;
        this.caretIndex = selection.startIndex;
        return clearAndDraw();
      }
      movement = true;

      if (e.ctrlKey || e.altKey) {
        let closestStartOfWord = false;
        if (this.caretPosition === 'before') {
          const previous = this.findPrevious(this.caretIndex);
          if (previous !== false) {
            closestStartOfWord = this.findClosestStartOfWord(previous);
          }
        } else {
          closestStartOfWord = this.findClosestStartOfWord(this.caretIndex);
        }

        if (closestStartOfWord === false) {
          return clearAndDraw();
        }

        if (this.isFirstOfLine(closestStartOfWord)) {
          this.caretIndex = closestStartOfWord;
          this.caretPosition = 'before';
        } else {
          this.caretIndex = this.findPrevious(closestStartOfWord);
          this.caretPosition = 'after';
        }
      } else if (this.isFirstOfLine(this.caretIndex)) {
        if (this.caretPosition === 'after') {
          this.caretPosition = 'before';
        } else {
          const previous = this.findEndOfPreviousLine(this.caretIndex);
          if (previous !== false) {
            this.caretPosition = 'after';
            this.caretIndex = previous;
          } else {
            movement = false;
          }
        }
      } else {
        this.caretPosition = 'after';
        this.caretIndex = this.findPrevious(this.caretIndex);
      }
      e.preventDefault();

    // Right
    } else if (e.which === 39 && !e.metaKey) {
      if (shouldClearSelection()) {
        const selection = this.getSelection();
        this.caretPosition = selection.endPosition;
        this.caretIndex = selection.endIndex;
        return clearAndDraw();
      }
      movement = true;
      if (e.ctrlKey || e.altKey) {
        let closestEndOfWord = false;
        if (this.caretPosition === 'before') {
          const next = this.findNext(this.caretIndex);
          if (this.children[this.caretIndex].char !== ' '
            && next && this.children[next].char === ' ') {
            closestEndOfWord = this.caretIndex;
          } else {
            const previous = this.findPrevious(this.caretIndex);
            if (previous !== false) {
              closestEndOfWord = this.findClosestEndOfWord(previous);
            } else {
              closestEndOfWord = this.findClosestEndOfWord(this.caretIndex);
            }
          }
        } else {
          closestEndOfWord = this.findClosestEndOfWord(this.caretIndex);
        }

        if (closestEndOfWord === false) {
          return clearAndDraw();
        }

        this.caretIndex = closestEndOfWord;
        this.caretPosition = 'after';
      } else if (this.isLastOfLine(this.caretIndex) && this.caretPosition === 'after') {
        const next = this.findStartOfNextLine(this.caretIndex);
        if (next !== false) {
          this.caretPosition = 'before';
          this.caretIndex = next;
        } else {
          movement = false;
        }
      } else if (this.caretPosition === 'before') {
        this.caretPosition = 'after';
      } else {
        const next = this.findNext(this.caretIndex);
        if (next !== false) {
          this.caretIndex = next;
        }
      }
      e.preventDefault();

    // Home or Left
    } else if (e.which === 36 || e.metaKey && e.which === 37) {
      const first = this.findStartOfLine(this.caretIndex);
      if (first !== false) {
        this.caretIndex = first;
        this.caretPosition = 'before';
      }

      if (shouldClearSelection()) {
        return clearAndDraw();
      }

      movement = true;
      e.preventDefault();

    // End or Right
    } else if (e.which === 35 || e.metaKey && e.which === 39) {
      const last = this.findEndOfLine(this.caretIndex);
      if (last !== false) {
        this.caretIndex = last;
        this.caretPosition = 'after';
      }
      if (shouldClearSelection()) {
        return clearAndDraw();
      }
      movement = true;
      e.preventDefault();

    // Nothing: Tab
    } else if (e.which === 9) {
      e.preventDefault();

    // Backspace
    } else if (e.which === 8) {
      if (self.isThereSelection() || e.ctrlKey || e.altKey) {
        let selection = [];
        if (self.isThereSelection()) {
          selection = this.getSelectedIndexes();
        } else {
          let closestStartOfWord = false;
          let endOfSelection = this.caretIndex;
          if (this.caretPosition === 'before') {
            const previous = this.findPrevious(this.caretIndex);
            if (previous !== false) {
              closestStartOfWord = this.findClosestStartOfWord(previous);
            }
            endOfSelection--;
          } else {
            closestStartOfWord = this.findClosestStartOfWord(this.caretIndex);
          }
          if (closestStartOfWord === false) {
            return clearAndDraw();
          }
          for (let i = closestStartOfWord; i <= endOfSelection; i++) {
            selection.push(i);
          }
        }

        const indexBeforeSelection = this.findPrevious(selection[0]);
        const indexAfterSelection = this.findNext(selection[selection.length - 1]);
        if (this.children[indexBeforeSelection]
          && this.children[indexBeforeSelection].char === ' '
          && this.children[indexAfterSelection]
          && this.children[indexAfterSelection].char === ' ') {
          this.deleteCharsFromTo(selection[0], indexAfterSelection);
        } else {
          this.deleteCharsFromTo(selection[0], selection[selection.length - 1]);
        }

        if (this.children[indexBeforeSelection]) {
          if (this.isLastOfLine(indexBeforeSelection)) {
            const nextChild = this.findStartOfNextLine(indexBeforeSelection);
            if (nextChild) {
              this.caretIndex = nextChild;
              this.caretPosition = 'before';
            } else {
              this.caretIndex = indexBeforeSelection;
              this.caretPosition = 'after';
            }
          } else {
            this.caretIndex = indexBeforeSelection;
            this.caretPosition = 'after';
          }
        } else {
          if (this.children[0]) {
            this.caretIndex = 0;
            this.caretPosition = 'before';
          } else {
            this.positionCaretInEmptyElement();
            return false;
          }
        }
        return clearAndDraw();
      }

      if (this.caretPosition === 'after') {
        const next = this.findNext(this.caretIndex);
        const previous = this.findPrevious(this.caretIndex);
        const firstOfLine = this.isFirstOfLine(this.caretIndex);
        if (this.children[next] && this.children[next].char === ' '
          && this.children[previous] && this.children[previous].char === ' ') {
          this.deleteCharsFromTo(this.caretIndex, next);
        } else {
          this.deleteCharsFromTo(this.caretIndex);
        }
        if (firstOfLine && this.children[this.caretIndex]) {
          this.caretPosition = 'before';
        } else if (this.children[previous]) {
          this.caretIndex = previous;
        } else {
          if (this.children[0]) {
            this.caretIndex = 0;
            this.caretPosition = 'before';
          } else {
            this.positionCaretInEmptyElement();
            return false;
          }
        }
      } else {
        const previous = this.findPrevious(this.caretIndex);
        if (previous !== false) {
          const beforePrevious = this.findPrevious(previous);
          if (this.children[beforePrevious]
            && this.children[beforePrevious].char === ' ' && this.caretIndex.char === ' ') {
            this.deleteCharsFromTo(beforePrevious, previous);
          } else {
            this.deleteCharsFromTo(previous);
          }
          this.caretIndex = beforePrevious;
          this.caretPosition = 'after';
        } else {
          //
        }
      }
      e.preventDefault();

    // Delete
    } else if (e.which === 46) {
      if (self.isThereSelection() || e.ctrlKey || e.altKey) {
        let selection = [];
        if (self.isThereSelection()) {
          selection = this.getSelectedIndexes();
        } else {
          let closestEndOfWord = false;
          let startOfSelection = this.caretIndex;
          if (this.caretPosition === 'before') {
            const next = this.findNext(this.caretIndex);
            if (this.children[this.caretIndex].char !== ' '
              && next && this.children[next].char === ' ') {
              closestEndOfWord = this.caretIndex;
            } else {
              const previous = this.findPrevious(this.caretIndex);
              if (previous !== false) {
                closestEndOfWord = this.findClosestEndOfWord(previous);
              } else {
                closestEndOfWord = this.findClosestEndOfWord(this.caretIndex);
              }
            }
          } else {
            closestEndOfWord = this.findClosestEndOfWord(this.caretIndex);
          }

          if (this.caretPosition === 'after') {
            startOfSelection++;
          }

          if (closestEndOfWord === false) {
            return clearAndDraw();
          }

          for (let i = startOfSelection; i <= closestEndOfWord; i++) {
            selection.push(i);
          }
        }
        const indexBeforeSelection = this.findPrevious(selection[0]);
        const indexAfterSelection = this.findNext(selection[selection.length - 1]);
        const previous = this.findPrevious(selection[0]);
        if (this.children[indexBeforeSelection]
          && this.children[indexBeforeSelection].char === ' '
          && this.children[indexAfterSelection]
          && this.children[indexAfterSelection].char === ' ') {
          this.deleteCharsFromTo(selection[0], indexAfterSelection);
        } else {
          this.deleteCharsFromTo(selection[0], selection[selection.length - 1]);
        }
        if (this.children[selection[0]] && this.isFirstOfLine(selection[0])) {
          this.caretPosition = 'before';
          this.caretIndex = selection[0];
        } else {
          if (previous !== false) {
            this.caretIndex = previous;
            this.caretPosition = 'after';
          } else {
            this.positionCaretInEmptyElement();
            return false;
          }
        }
        return clearAndDraw();
      } else if (this.caretPosition === 'before') {
        const previous = this.findPrevious(this.caretIndex);
        this.deleteCharsFromTo(this.caretIndex);
        if (!this.children[this.caretIndex]) {
          if (previous !== false) {
            this.caretPosition = 'after';
            this.caretIndex = previous;
          } else {
            this.positionCaretInEmptyElement();
            return false;
          }
        }
      } else {
        const next = this.findNext(this.caretIndex);
        let afterNext = false;
        if (next !== false) {
          afterNext = this.findNext(next);
        }
        if (this.children[this.caretIndex]
          && this.children[this.caretIndex].char === ' '
          && this.children[afterNext]
          && this.children[afterNext].char === ' ') {
          this.deleteCharsFromTo(next, afterNext);
        } else if (next !== false) {
          this.deleteCharsFromTo(next);
        }
      }

    // Ctrl + X or Cmd + X
    } else if (keyChecker(e.which === 88 && e.ctrlKey, e.which === 88 && e.metaKey)) {
      if (this.isThereSelection()) {
        const html = inlineToHTML(this.getSelectedChildren());
        electron.clipboardSet(htmlToText(html), html);
        this.keydownHandler({
          which: 8,
          preventDefault: function preventDefault() {}
        });
        return false;
      }

    // Ctrl + C or Cmd + C
    } else if (keyChecker(e.which === 67 && e.ctrlKey, e.which === 67 && e.metaKey)) {
      if (this.isThereSelection()) {
        const html = inlineToHTML(this.getSelectedChildren());
        electron.clipboardSet(htmlToText(html), html);
        return false;
      }

    // Nothing: Windows
    } else if (e.which === 91) {
      e.preventDefault();
      return false;
    }

    if (movement && e.shiftKey) {
      const [start, end] =
        this.rangeToIndexes(oldCaretIndex, oldCaretPosition, this.caretIndex, this.caretPosition);

      this.toggleSelection(start, end);
    }

    if (this.isThereSelection()) {
      app.inlineEditingBar.matchCharacterStyles(this.getSelectedChildren());
    } else if (movement) {
      app.inlineEditingBar.matchCharacterStyles(this.children[this.caretIndex]);
    }

    this.drawCaret();
    return false;

    function shouldClearSelection() {
      return !e.shiftKey && self.isThereSelection();
    }

    function clearAndDraw() {
      self.clearAndDraw();
      e.preventDefault();
      return false;
    }
  }

  clearAndDraw() {
    this.clearSelection();
    this.drawCaret();
    app.inlineEditingBar.matchCharacterStyles(this.children[this.caretIndex]);
  }

  positionCaretInEmptyElement() {
    if (!this.children.length) {
      this.children.push(new InlineCharacter(' '));
      this.update();
    }
    this.caretIndex = 0;
    this.caretPosition = 'before';
    this.clearAndDraw();
  }

  insertOp(txt) {
    app.focusTarget.text(txt);
    app.focusTarget.trigger('input');
  }

  /**
   * @param e
   */
  inputHandler() {
    let content = app.focusTarget.html();
    content = content.replace(/[^\S\n]/g, ' ');
    content = content.replace(/\n+/g, '<br>');
    if (!content.length) return false;

    const parsed = htmlToInline(content, app.inlineEditingBar, this.blacklist);
    if (!parsed.length) return false;

    if (this.isThereSelection()) {
      const selection = this.getSelectedIndexes();
      const indexBeforeSelection = this.findPrevious(selection[0]);
      const indexAfterSelection = this.findNext(selection[selection.length - 1]);
      const previous = this.findPrevious(selection[0]);
      if (this.children[indexBeforeSelection]
        && this.children[indexBeforeSelection].char === ' '
        && this.children[indexAfterSelection]
        && this.children[indexAfterSelection].char === ' '
        && parsed[parsed.length - 1].char === ' ') {
        this.deleteCharsFromTo(selection[0], indexAfterSelection);
      } else {
        this.deleteCharsFromTo(selection[0], selection[selection.length - 1]);
      }
      if (this.children[selection[0]] && this.isFirstOfLine(selection[0])) {
        this.caretPosition = 'before';
        this.caretIndex = selection[0];
      } else {
        if (previous !== false) {
          this.caretIndex = previous;
          this.caretPosition = 'after';
        } else {
          this.positionCaretInEmptyElement();
        }
      }
    }
    if (this.caretPosition === 'before') {
      if (parsed.length === 1
        && parsed[0].char === ' '
        && this.children[this.caretIndex].char === ' ') {
        this.caretPosition = 'after';
      } else {
        if (this.children[this.caretIndex - 1]
          && this.children[this.caretIndex - 1].char === ' '
          && parsed[0].char === ' ') {
          parsed.shift();
        }
        if (this.children[this.caretIndex]
          && this.children[this.caretIndex].char === ' '
          && parsed[parsed.length - 1]
          && parsed[parsed.length - 1].char === ' ') {
          parsed.pop();
        }
        if (parsed.length) {
          this.children.splice.apply(this.children, [this.caretIndex, 0].concat(parsed));
          this.caretIndex = this.caretIndex + parsed.length - 1;
          this.caretPosition = 'after';
        }
      }
    } else {
      if (parsed.length === 1
        && parsed[0].char === ' '
        && this.children[this.caretIndex + 1]
        && this.children[this.caretIndex + 1].char === ' ') {
        // const beforeSpace = this.children[this.caretIndex];
        this.caretIndex++;
        this.children[this.caretIndex].copyStyles(app.inlineEditingBar);
      } else {
        if (this.children[this.caretIndex]
          && this.children[this.caretIndex].char === ' '
          && parsed[0].char === ' ') {
          parsed.shift();
        }
        if (this.children[this.caretIndex + 1]
          && this.children[this.caretIndex + 1].char === ' '
          && parsed[parsed.length - 1]
          && parsed[parsed.length - 1].char === ' ') {
          parsed.pop();
        }
        this.children.splice.apply(this.children, [this.caretIndex + 1, 0].concat(parsed));
        this.caretIndex = this.caretIndex + parsed.length;
      }
    }
    this.update();
    this.updateDimensions();
    this.drawCaret();
    app.focusTarget.html('');
  }

  commit() {
    if (this.isInlineEditingActivated) {
      this.deactivateInlineEditing();
      this.update();
      if (!inlineCompare(this._originalChildren, this.children)) {
        const original = this._originalChildren;
        const current = this.children.map(c => c.clone());

        app.context.history.add({
          name: 'Edit Text',
          undo: () => {
            this.children.length = 0;
            this.children.push.apply(this.children, original);
            this.update();
            this.updateDimensions();
          },
          redo: () => {
            this.children.length = 0;
            this.children.push.apply(this.children, current);
            this.update();
            this.updateDimensions();
          }
        });
      }
      this._originalChildren = null;
    }
  }

  discard() {
    this.deactivateInlineEditing();
    this.children.length = 0;
    this.children.push.apply(this.children, this._originalChildren);
    this._originalChildren = null;
    this.update();
    this.updateDimensions();
  }

  activateInlineEditingAndEmpty() {
    this.activateInlineEditing();
    this.children = [];
    this.positionCaretInEmptyElement();
    this.update();
  }

  activateInlineEditingAndMoveCaretToEnd() {
    if (this.children.length) {
      this.caretIndex = this.children.length - 1;
      this.caretPosition = 'after';
    }
    this.activateInlineEditing();
  }

  activateInlineEditing() {
    if (!this.isFocused()) {
      this.focus();
    }
    this.isInlineEditingActivated = true;
    this.element.attr('bs-inline-edited', 1);
    this.drawCaret();
    this._originalChildren = this.children.map(c => c.clone());

    app.trigger('component-inlineediting-start', this);
    app.focusTarget.html('');
    app.focusTarget.off('.inlineEditing');
    app.on('keydown.inlineEditing', this.keydownHandler.bind(this), 10);
    app.focusTarget.on('input.inlineEditing', this.inputHandler.bind(this));

    app.canvas.markAsFocused(this);
    app.canvas.removeHighlight();
  }

  deactivateInlineEditing() {
    if (!this.isInlineEditingActivated) return false;

    this.caretPosition = 'before';
    this.caretIndex = 0;
    this.element.removeAttr('bs-inline-edited');

    app.off('.inlineEditing');
    app.focusTarget.off('.inlineEditing');

    this.isInlineEditingActivated = false;
    this.hideCaret();
    this.clearSelection();

    app.trigger('component-inlineediting-end', this);
  }

  findContextParent(inlineElement) {
    if (this.contextCache.has(inlineElement)) {
      return this.contextCache.get(inlineElement);
    }

    let element = inlineElement.element[0];

    while (element = element.parentNode) {
      if (element === this.element[0]) {
        this.contextCache.set(inlineElement, element);
        return element;
      }

      const style = window.getComputedStyle(element);
      if (style.float !== 'none' || style.position !== 'static' || style.margin !== '0px') {
        this.contextCache.set(inlineElement, element);
        return element;
      }
    }
    return null;
  }

  findNext(index) {
    if (index >= this.children.length - 1) return false;
    const currentContext = this.findContextParent(this.children[index]);
    if (currentContext === this.findContextParent(this.children[index + 1])) {
      return index + 1;
    }
    return false;
  }

  findPrevious(index) {
    if (index <= 0) return false;
    if (!this.children[index]) return false;
    const currentContext = this.findContextParent(this.children[index]);
    if (currentContext === this.findContextParent(this.children[index - 1])) {
      return index - 1;
    }
    return false;
  }

  findLine(index) {
    const line = [this.children[index]];
    const current = this.children[index];
    current.updateDimensionsIfNeeded();

    let next = {};
    let i = index;
    while ((i = this.findPrevious(i)) !== false) {
      next = this.children[i];
      next.updateDimensionsIfNeeded();
      if (current.onTheSameRowWith(next)) {
        line.unshift(this.children[i]);
      } else {
        break;
      }
    }

    i = index;
    while (i = this.findNext(i)) {
      next = this.children[i];
      next.updateDimensionsIfNeeded();
      if (current.onTheSameRowWith(next)) {
        line.push(this.children[i]);
      } else {
        break;
      }
    }
    if (line.length > 1 && line[line.length - 1].char === ' ') {
      line.length--;
    }
    return line;
  }

  findStartOfNextLine(index) {
    const current = this.children[index];
    current.updateDimensionsIfNeeded();

    let i = index;
    while (i = this.findNext(i)) {
      this.children[i].updateDimensionsIfNeeded();
      if (!current.onTheSameRowWith(this.children[i])) {
        return i;
      }
    }
    return false;
  }

  findEndOfPreviousLine(index) {
    const current = this.children[index];
    current.updateDimensionsIfNeeded();

    let i = index;
    let foundSpace = false;

    while ((i = this.findPrevious(i)) !== false) {
      this.children[i].updateDimensionsIfNeeded();
      if (!current.onTheSameRowWith(this.children[i])) {
        if (this.children[i].char === ' ' && !foundSpace) {
          foundSpace = true;
          continue;
        }
        return i;
      }
    }
    return false;
  }

  findClosestStartOfWord(index) {
    if (index < 0) return false;

    let inWord = this.children[index].char !== ' ';
    let lastWordIndex = inWord ? index : false;
    let i = index;

    while ((i = this.findPrevious(i)) !== false) {
      if (this.children[i].char === ' ') {
        if (inWord) {
          return lastWordIndex;
        }
      } else {
        inWord = true;
        lastWordIndex = i;
      }
    }
    return lastWordIndex;
  }

  findClosestEndOfWord(index) {
    let inWord = false;
    let lastWordIndex = false;
    let i = index;
    while (i = this.findNext(i)) {
      if (this.children[i].char === ' ') {
        if (inWord) {
          return lastWordIndex;
        }
      } else {
        inWord = true;
        lastWordIndex = i;
      }
    }
    return lastWordIndex;
  }

  findBoundariesOfCurrentWord(index) {
    if (this.children[index].char === ' ') {
      return [index, index];
    }

    let i = index;
    let start = index;
    while (i !== false) {
      if (this.children[i].char === ' ') {
        break;
      }
      start = i;
      i = this.findPrevious(i);
    }

    let end = index;
    i = index;
    while (i) {
      if (this.children[i].char === ' ') {
        break;
      }
      end = i;
      i = this.findNext(i);
    }
    return [start, end];
  }

  findNextLine(index) {
    const startOfNext = this.findStartOfNextLine(index);
    if (startOfNext === false) return false;
    return this.findLine(startOfNext);
  }

  findPreviousLine(index) {
    const endOfPrevious = this.findEndOfPreviousLine(index);
    if (endOfPrevious === false) return false;
    return this.findLine(endOfPrevious);
  }

  findStartOfLine(index) {
    const first = this.findFirstOfLine(index);
    const i = this.children.indexOf(first);
    return i === -1 ? false : i;
  }

  findEndOfLine(index) {
    const last = this.findLastOfLine(index);
    const i = this.children.indexOf(last);
    return i === -1 ? false : i;
  }

  findFirstOfLine(index) {
    return this.findLine(index)[0];
  }

  findLastOfLine(index) {
    return this.findLine(index).pop();
  }

  isFirstOfLine(index) {
    return this.children[index] === this.findFirstOfLine(index);
  }

  isLastOfLine(index) {
    return this.children[index] === this.findLastOfLine(index);
  }

  rangeToIndexes(startIndex, startPosition, endIndex, endPosition) {
    if (startIndex > endIndex
      || startIndex === endIndex
      && startPosition === 'after'
      && endPosition === 'before') {
      let tmp = startIndex;
      startIndex = endIndex;
      endIndex = tmp;
      tmp = startPosition;
      startPosition = endPosition;
      endPosition = tmp;
    }

    let start = startIndex;
    if (startPosition === 'after') {
      start++;
    }

    let end = endIndex;
    if (endPosition === 'before') {
      end--;
    }

    return [start, end];
  }

  toggleSelection(start, end) {
    for (let i = start; i <= end; i++) {
      this.children[i].selected = !this.children[i].selected;
      this.children[i].update();
    }

    let selectionsCount = 0;
    let previousSelected = false;
    for (let i = 0; i < this.children.length; i++) {
      if (!previousSelected && this.children[i].selected) {
        selectionsCount++;
      }
      previousSelected = this.children[i].selected;
    }

    if (selectionsCount > 1) {
      for (let i = 0; i < start; i++) {
        this.children[i].selected = false;
        this.children[i].update();
      }
      for (let i = end + 1; i < this.children.length; i++) {
        this.children[i].selected = false;
        this.children[i].update();
      }
    }
  }

  makeSelection(start, end) {
    const selected = [];
    for (let i = 0; i < this.children.length; i++) {
      if (i >= start && i <= end) {
        if (!this.children[i].selected) {
          this.children[i].selected = true;
          this.children[i].update();
        }
        selected.push(this.children[i]);
      } else {
        if (this.children[i].selected) {
          this.children[i].selected = false;
          this.children[i].update();
        }
      }
    }
    this.drawCaret();
    if (selected.length) {
      app.inlineEditingBar.matchCharacterStyles(selected);
    }
  }

  clearSelection() {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].selected) {
        this.children[i].selected = false;
        this.children[i].update();
      }
    }
  }

  isThereSelection() {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].selected) {
        return true;
      }
    }
    return false;
  }

  getSelection() {
    const selection = {
      startPosition: 'before',
      startIndex: -1,
      endPosition: 'after',
      endIndex: -1
    };

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].selected) {
        if (selection.startIndex === -1) {
          selection.startIndex = i;
        }
        selection.endIndex = i;
      }
    }

    if (!this.isFirstOfLine(selection.startIndex)) {
      selection.startIndex = this.findPrevious(selection.startIndex);
      selection.startPosition = 'after';
    }

    return selection;
  }

  getSelectedIndexes() {
    const selectedIndexes = [];
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].selected) {
        selectedIndexes.push(i);
      }
    }

    return selectedIndexes;
  }

  getSelectedChildren() {
    const selected = [];
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].selected) {
        selected.push(this.children[i]);
      }
    }

    return selected;
  }

  deleteCharsFromTo(start, end) {
    if (end !== undefined) {
      this.children.splice(start, end - start + 1);
    } else {
      this.children.splice(start, 1);
    }
    this.update();
    this.updateDimensions();
  }

  calcCaretPosition(index, position) {
    index = index || this.caretIndex;
    position = position || this.caretPosition;

    const where = this.children[index];
    if (!where) return false;

    where.updateDimensionsIfNeeded();

    const zoom = app.context.canvasDimensions.zoom;
    return {
      left: (position === 'before' ? where.x + 1 : where.x2 - 1) * zoom,
      top: where.y * zoom,
      height: where.caretHeight() * zoom
    };
  }

  drawCaret() {
    const position = this.calcCaretPosition();
    if (!position) {
      return;
    }

    if (this.isThereSelection()) {
      app.canvas.inlineCaret.hide();
      return;
    }

    app.canvas.inlineCaret.show();
    app.canvas.inlineCaret.css(position);
    app.canvas.inlineCaret.addClass('no-blink');

    clearTimeout(this._noBlinkTimeout);
    this._noBlinkTimeout = setTimeout(() => {
      app.canvas.inlineCaret.removeClass('no-blink');
    }, 500);
  }

  hideCaret() {
    app.canvas.inlineCaret.hide();
  }

  startUpdate() {
    if (this.isInlineEditingActivated) {
      this.contextCache = new WeakMap;
      this.attributes['bs-inline-edited'] = 1;
    } else {
      delete this.attributes['bs-inline-edited'];
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update();
    }

    if (this.context().isExport) {
      this.element.html(inlineToHTML(this.children));
      Component.prototype.startUpdate.call(this);
      return this.element;
    }

    for (let i = 0; i < this.children.length; i++) {
      this.page().inlineDOMToComponent.set(this.children[i].element[0], this.children[i]);
    }

    const tree = inlineToDOM(this.children);
    this.element.empty();
    this.element.append(tree);
    Component.prototype.startUpdate.call(this);
    return this.element;
  }

  updateDimensions() {
    Component.prototype.updateDimensions.call(this);

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof InlineWrapper) {
        this.children[i].updateDimensions();
      } else {
        this.children[i].needsDimensionUpdate = true;
      }
    }
    if (this.isInlineEditingActivated) {
      app.canvas.markAsFocused(this);
    }
  }
}
