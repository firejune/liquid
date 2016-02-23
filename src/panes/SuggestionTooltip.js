import escapeRegexString from '../helpers/escapeRegexString';
import escapeHTML from 'escape-html';

class SuggestionTooltip {
  constructor(textBox, suggestions, options = {}) {
    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    this.textBox = textBox;
    this.suggestions = suggestions;
    this.filteredSuggestions = [];
    this.options = options;
    this.element = $('<div class="suggestion-tooltip">');
    this.element.hide().appendTo(document.body);
    this.chosenOption = -1;
    this.visible = false;

    textBox.on('keydown.tooltip', this.keyDown.bind(this));
    doc.on('scroll.tooltip resize.tooltip', this.hide.bind(this));

    this.element.on('mousedown', this.mouseDown.bind(this));
    this.activeSuggestionGroup = null;
  }

  mouseDown(e) {
    const index = this.element.find('.result').index(e.target);
    if (index === -1) return false;

    this.insertSuggestion(this.filteredSuggestions[index]);
    this.destroy();
    this.textBox.focus();
    if (this.options.onSelect) {
      this.options.onSelect(this.textBox.text());
    }

    e.preventDefault();
    e.stopPropagation();
  }

  keyDown(e) {
    let preventDefault = true;
    let update = false;

    // Up
    if (e.which === 38) {
      if (this.visible) {
        this.chosenOption--;
        if (this.chosenOption < 0) {
          this.chosenOption = this.filteredSuggestions.length - 1;
        }
        update = true;
      }

    // Down
    } else if (e.which === 40) {
      if (this.visible) {
        this.chosenOption++;
        if (this.chosenOption >= this.filteredSuggestions.length) {
          this.chosenOption = 0;
        }
        update = true;
      }

    // Enter or Tab
    } else if (e.which === 13 || e.which === 9) {
      if (!this.isOptionChosen()) return;
      if (e.which === 9 && e.shiftKey) {
        return;
      }

      if (e.which === 9) {
        preventDefault = false;
      }

      if (this.visible) {
        if (this.activeSuggestionGroup) {
          this.insertSuggestion(this.filteredSuggestions[this.chosenOption]);
        }
        this.hide();
        if (this.options.onSelect) {
          this.options.onSelect(this.textBox.text());
        }
        if (preventDefault) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
        return;
      }

    // ESC
    } else if (e.which === 27) {
      if (this.visible) {
        this.hide();
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

    // Left or Right or Home or End
    } else if (e.which === 37 || e.which === 39 || e.which === 36 || e.which === 35) {
      preventDefault = false;
    } else {
      preventDefault = false;
      this.chosenOption = 0;
      update = true;
    }

    if (update) {
      setTimeout(this.update.bind(this), 20);
    }

    if (this.visible && preventDefault) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }

  insertSuggestion(str) {
    const content = this.textBox.text().trim();
    const suggestion = str;
    const append = this.activeSuggestionGroup.appendAfterInsert || '';
    const tmp = content.match(this.activeSuggestionGroup.condition);
    if (tmp && tmp[1] && tmp[1].trim().length) {
      const regex = new RegExp(`${escapeRegexString(tmp[1])}$`);
      this.textBox.text(content.replace(regex, suggestion) + append);
    } else {
      this.textBox.text(content + suggestion + append);
    }

    const range = document.createRange();
    range.selectNodeContents(this.textBox[0]);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  isOptionChosen() {
    return this.chosenOption >= 0 && this.chosenOption < this.filteredSuggestions.length;
  }

  update() {
    if (!this.visible && this.textBox.text().length === 0) {
      this.chosenOption = -1;
    }
    this.element.empty();
    this.filteredSuggestions = [];

    const textBoxContent = this.textBox.text().trim();
    let searchRegex = /^/;
    let tmp = [];
    let searchString = '';

    for (let i = 0; i < this.suggestions.length; i++) {
      tmp = textBoxContent.match(this.suggestions[i].condition);
      if (tmp) {
        if (tmp[1]) {
          searchRegex = new RegExp(`^${escapeRegexString(tmp[1])}`, 'i');
          searchString = tmp[1];
        }
        if (typeof this.suggestions[i].items === 'function') {
          this.filteredSuggestions = this.suggestions[i].items();
        } else {
          this.filteredSuggestions = this.suggestions[i].items;
        }
        this.activeSuggestionGroup = this.suggestions[i];
        break;
      }
    }

    this.filteredSuggestions = this.filteredSuggestions
      .filter(p => searchRegex.test(p))
      .slice(0, 10);

    if (this.filteredSuggestions.length === 1 && this.filteredSuggestions[0] === searchString) {
      this.filteredSuggestions = [];
    }

    const html = this.filteredSuggestions.map(r =>
      `<div class="result"> ${escapeHTML(r).replace(searchRegex, '<span>$&</span>')} </div>`
    );

    this.element.html(html);
    if (this.filteredSuggestions.length) {
      this.show();
    } else {
      this.hide();
    }

    if (this.isOptionChosen()) {
      this.element.find('div').eq(this.chosenOption).addClass('selected');
    }

    const textBox = this.textBox[0];
    // const li = textBox.parentNode;

    if (!textBox || !textBox.parentNode) {
      return;
    }

    const winHeight = win.height();
    const winWidth = win.width();
    const rect = textBox.getBoundingClientRect();

    if (winHeight - rect.bottom >= rect.top) {
      this.element.css({
        top: rect.bottom + 5,
        bottom: 'auto'
      });
    } else {
      this.element.css({
        top: 'auto',
        bottom: winHeight - rect.top + 10
      });
    }

    if (this.element.width() + rect.left >= winWidth) {
      this.element.css({
        left: 'auto',
        right: 20
      });
    } else {
      this.element.css({
        left: rect.left,
        right: 'auto'
      });
    }

    return this.element;
  }

  show() {
    if (!this.visible) {
      this.visible = true;
      this.element.show();
    }
  }

  hide() {
    if (this.visible) {
      this.visible = false;
      this.element.hide();
    }
  }

  destroy() {
    doc.off('.tooltip');
    this.textBox.off('.tooltip');
    this.element.remove();
  }
}

export default SuggestionTooltip;
