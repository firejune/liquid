import equal from 'deep-equal';
import Bar from './Bar';
import keyChecker from '../helpers/keyChecker';

export default class InlineEditingBar extends Bar {
  constructor(elem) {
    super();

    this.element = elem;
    this.inlineEditable = null;
    this.setDefault();

    elem.on('click', 'span', this.onModifierClick.bind(this));
    elem.on('click', 'a.discard', this.discardChanges.bind(this));
    elem.on('click', 'a.save', this.commitChanges.bind(this));
    elem.on('click', 'a.character-input', this.clickCharInput.bind(this));

    app.on('keydown', this.keydown.bind(this));
    app.on('component-inlineediting-start', this.inlineEditingStart.bind(this));
    app.on('component-inlineediting-end', this.inlineEditingEnd.bind(this));
  }

  inlineEditingStart(component) {
    this.show();
    this.setInlineEditable(component);
  }

  /**
   * @param component
   */
  inlineEditingEnd() {
    this.hide();
    this.setInlineEditable(null);
  }

  clickCharInput() {
    app.characterInputDialog.open({
      showBackground: false,
      canBeMoved: true
    });
  }

  keydown(e) {
    if (!this.isVisible()) return;
    // Bold: Ctrl + B or Cmd + B
    if (keyChecker(e.ctrlKey && e.which === 66, e.metaKey && e.which === 66)) {
      this.element.find('span.bold:visible').click();
      e.preventDefault();
      return false;
    }

    // Italic: Ctrl + I or Cmd + I
    if (keyChecker(e.ctrlKey && e.which === 73, e.metaKey && e.which === 73)) {
      this.element.find('span.italic:visible').click();
      e.preventDefault();
      return false;
    }

    // Underline: Ctrl + U or Cmd + U
    if (keyChecker(e.ctrlKey && e.which === 85, e.metaKey && e.which === 85)) {
      this.element.find('span.underline:visible').click();
      e.preventDefault();
      return false;
    }

    // Link: Ctrl + K or Cmd + K
    if (keyChecker(e.ctrlKey && e.which === 75, e.metaKey && e.which === 75)) {
      this.element.find('span.link:visible').click();
      e.preventDefault();
      return false;
    }

    // Select All: Ctrl + A or Cmd + A
    if (keyChecker(e.ctrlKey && e.which === 65, e.metaKey && e.which === 65)) {
      this.inlineEditable.selectAll();
      e.preventDefault();
      return false;
    }
  }

  discardChanges() {
    if (!this.inlineEditable) {
      return false;
    }
    this.inlineEditable.discard();
  }

  commitChanges() {
    if (!this.inlineEditable) {
      return false;
    }
    this.inlineEditable.commit();
  }

  onModifierClick(e) {
    if (!this.inlineEditable) {
      return false;
    }

    const elem = $(e.currentTarget);
    if (elem.hasClass('bold')) {
      dealWith('bold');
    } else if (elem.hasClass('italic')) {
      dealWith('italic');
    } else if (elem.hasClass('strike')) {
      dealWith('strike');
    } else if (elem.hasClass('underline')) {
      dealWith('underline');
    } else if (elem.hasClass('link')) {
      app.linkDialog.open({
        link: this.link,
        onSave: (href, target) => {
          href = href.trim();
          this.link = false;
          if (href) {
            this.link = {
              href,
              target
            };
          }
          elem.toggleClass('active', !!this.link);
          this.modifySelectedChildren('link', this.link);
          this.updateEditable();
        },
        onClose: function onClose() {}
      });
    } else if (elem.hasClass('clear-styles')) {
      this.resetSelectedChildren();

      const self = this;
      this.element.find('.active').each(function() {
        if (self[this.dataset.id]) {
          self[this.dataset.id] = false;
        }
      }).removeClass('active');
    }
    this.updateEditable();

    function dealWith(prop) {
      self[prop] = !self[prop];
      elem.toggleClass('active', self[prop]);
      self.modifySelectedChildren(prop, self[prop]);
    }
  }

  modifySelectedChildren(prop, value) {
    const editable = this.inlineEditable;
    if (!editable.isThereSelection()) return false;

    const elements = editable.getSelectedChildren();
    for (let i = 0; i < elements.length; i++) {
      elements[i][prop] = value;
    }
    return true;
  }

  resetSelectedChildren() {
    const editable = this.inlineEditable;
    if (!editable.isThereSelection()) return false;

    const elements = editable.getSelectedChildren();
    for (let i = 0; i < elements.length; i++) {
      elements[i].reset();
    }
    return true;
  }

  updateEditable() {
    if (this.inlineEditable) {
      this.inlineEditable.update();
      this.inlineEditable.updateDimensions();
      this.inlineEditable.drawCaret();
    }
  }

  setDefault() {
    this.bold = false;
    this.italic = false;
    this.strike = false;
    this.underline = false;
    this.link = false;
  }

  setInlineEditable(editable) {
    this.inlineEditable = editable;
  }

  matchCharacterStyles(param) {
    if (!param) {
      this.setDefault();
      return this.update();
    }
    if (!Array.isArray(param)) {
      param = [param];
    }
    this.bold = true;
    this.italic = true;
    this.strike = true;
    this.underline = true;
    this.link = param[0].link || false;

    // let allHaveLink = true;
    // let allHaveTheSameLink = true;
    for (let i = 0; i < param.length; i++) {
      this.bold = this.bold && param[i].bold;
      this.italic = this.italic && param[i].italic;
      this.strike = this.strike && param[i].strike;
      this.underline = this.underline && param[i].underline;
      if (!equal(this.link, param[i].link)) {
        this.link = false;
      }
    }
    this.update();
  }

  hide() {
    super.hide();

    if (app.characterInputDialog.isVisible()) {
      app.characterInputDialog.close();
    }
  }

  update() {
    this.element.find('.bold').show().toggleClass('active', this.bold);
    this.element.find('.italic').show().toggleClass('active', this.italic);
    this.element.find('.strike').show().toggleClass('active', this.strike);
    this.element.find('.underline').show().toggleClass('active', this.underline);
    this.element.find('.link').show().toggleClass('active', !!this.link);

    const blacklist = this.inlineEditable.blacklist;
    for (let i = 0; i < blacklist.length; i++) {
      this.element.find(`.${blacklist[i]}`).hide();
    }
  }
}
