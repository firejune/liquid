import Box from '../base/Box';
import equal from 'deep-equal';

export default class InlineCharacter extends Box {
  constructor(char) {
    super();
    this.reset();
    this.selected = false;
    this.char = char;
    this.element = $('<inline-character>');
    this.needsDimensionUpdate = true;
  }

  reset() {
    this.bold = false;
    this.italic = false;
    this.strike = false;
    this.underline = false;
    this.link = false;
  }

  copyStyles(character) {
    this.bold = character.bold;
    this.italic = character.italic;
    this.strike = character.strike;
    this.underline = character.underline;
    this.link = false;
    if (character.link) {
      this.link = {
        href: character.link.href,
        target: character.link.target
      };
    }
  }

  sameAs(other) {
    return this.constructor === other.constructor
      && this.char === other.char
      && this.bold === other.bold
      && this.italic === other.italic
      && this.strike === other.strike
      && this.underline === other.underline
      && equal(this.link, other.link);
  }

  caretHeight() {
    return parseInt(this.element.css('line-height'), 10) || Math.round(this.height);
  }

  update() {
    this.element.toggleClass('selected', this.selected);
    this.element.toggleClass('space', this.char === ' ');
    return this.element.text(this.char);
  }

  updateDimensions() {
    const box = this.element[0].getBoundingClientRect();
    const lineHeight = parseInt(this.element.css('line-height'), 10) || Math.round(box.height);

    super.updateDimensions(box.left,
      box.top + (box.height - lineHeight) / 2, box.width, lineHeight);

    this.needsDimensionUpdate = false;
  }

  updateDimensionsIfNeeded() {
    if (this.needsDimensionUpdate) {
      this.updateDimensions();
    }
  }

  isFocused() {
    return false;
  }

  isVisible() {
    return true;
  }

  clone() {
    const n = new InlineCharacter(this.char);
    n.copyStyles(this);
    return n;
  }

  serialize() {
    return {
      'class': 'InlineCharacter',
      'char': this.char,
      bold: this.bold,
      italic: this.italic,
      strike: this.strike,
      underline: this.underline,
      link: this.link
    };
  }

  unserialize(obj) {
    this.char = obj.char;
    this.copyStyles(obj);
  }
}
