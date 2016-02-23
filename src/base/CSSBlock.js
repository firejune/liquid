import specificity from 'specificity';
import isMQValid from 'valid-media-queries';
import CSSRule from './CSSRule';
import normalizeCSSSelector from '../helpers/normalizeCSSSelector';
import specificityToNumber from '../helpers/specificityToNumber';
import escapeRegexString from '../helpers/escapeRegexString';

const cleanSelectorsRegex = /:hover|:active|:visited|:before|:after|:target|:focus/gi;

class CSSBlock {
  constructor(selector = '', rules = [], mediaQuery = false, system = false) {
    this.selector = selector;
    this.rules = rules;
    this.mediaQuery = mediaQuery;
    this.system = system;
  }

  isImageUsed(image) {
    const regex = new RegExp(`url\\(\\s*['"]?${escapeRegexString(image)}['"]?\\s*\\)`);
    for (let i = 0; i < this.rules.length; i++) {
      if (regex.test(this.rules[i].value)) {
        return true;
      }
    }
    return false;
  }

  isFontUsed(font) {
    const propertyRegex = /^(?:font-family|font)$/i;
    const valueRegex = new RegExp(`\\b${escapeRegexString(font)}\\b`, 'i');
    for (let i = 0; i < this.rules.length; i++) {
      if (propertyRegex.test(this.rules[i].property) && valueRegex.test(this.rules[i].value)) {
        return true;
      }
    }
    return false;
  }

  toString(prop) {
    if (!this.selector) return '';
    if (this.system) return '';
    let tmp = '\n';
    for (let i = 0; i < this.rules.length; i++) {
      tmp += this.rules[i].toString(prop);
    }

    if (this.mediaQuery !== false) {
      return `@media ${this.mediaQuery} {\n  ${this.selector}{${tmp.replace(/^ {2}/gm, '  ')}  }` +
        '\n}\n';
    }

    return `${this.selector}{${tmp}}\n`;
  }

  calculateSpecificityFor(element) {
    let max = 0;
    let spec;
    const selectors = [];

    for (let i = 0; i < this.specificity.length; i++) {
      try {
        if (element.matches(this.specificity[i].selector.replace(cleanSelectorsRegex, ''))) {
          spec = specificityToNumber(this.specificity[i].specificity);
          if (spec > max) {
            max = spec;
          }
          selectors.push({
            selector: normalizeCSSSelector(this.specificity[i].selector),
            specificity: spec
          });
        }
      } catch (err) {
        return false;
      }
    }

    if (!selectors.length) {
      return false;
    }

    return {
      specificity: max,
      selectors
    };
  }

  matchesElement(element) {
    try {
      return element.matches(this.selector.replace(cleanSelectorsRegex, ''));
    } catch (err) {
      return false;
    }
  }

  removeRule(rule) {
    const index = this.rules.indexOf(rule);
    if (index === -1) {
      return false;
    }
    return this.removeIndex(index);
  }

  addAtIndex(rules, index) {
    if (!Array.isArray(rules)) rules = [rules];
    Array.prototype.splice.apply(this.rules, [index, 0].concat(rules));
  }

  removeIndex(index) {
    this.rules.splice(index, 1);
  }

  cloneAsUserBlock() {
    const rules = this.rules.map(rule => rule.clone());
    rules.forEach(r => {
      r.system = false;
    });

    const newBlock = new CSSBlock(this.selector, rules, this.mediaQuery);
    newBlock.system = false;
    return newBlock;
  }

  clone() {
    const newBlock = new CSSBlock(this.selector, this.rules.map(rule => rule.clone()),
      this.mediaQuery);

    newBlock.system = this.system;
    return newBlock;
  }

  isMediaQueryValid() {
    return isMQValid(`@media ${this.mediaQuery}`);
  }

  isInheritable() {
    for (let i = 0; i < this.rules.length; i++) {
      if (this.rules[i].isInheritable()) return true;
    }
    return false;
  }

  isUserEmpty() {
    return !this.system && this.rules.length === 0;
  }

  cleanEmptyRules() {
    this.rules = this.rules.filter(r => !r.isEmpty());
  }

  serialize() {
    return {
      selector: this.selector,
      mediaQuery: this.mediaQuery,
      system: this.system,
      rules: this.rules.map(r => r.serialize())
    };
  }

  unserialize(obj) {
    this.selector = obj.selector;
    this.mediaQuery = obj.mediaQuery;
    this.system = obj.system || false;

    this.rules = obj.rules.map(r => {
      const tmp = new CSSRule;
      tmp.unserialize(r);
      return tmp;
    });
  }

  get selector() {
    return this._selector;
  }

  set selector(val) {
    this._selector = normalizeCSSSelector(val);
    this.specificity = specificity.calculate(val);
  }
}

CSSBlock.isSelectorValid = function(selector) {
  try {
    document.querySelector(selector);
    return true;
  } catch (err) {
    return false;
  }
};

export default CSSBlock;
