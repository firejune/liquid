import cssProperties from '../config/css-properties.js';
import color from 'onecolor';
import colorNames from 'color-name';

const colorRegex = /#[0-9a-f]{6}|#[0-9a-f]{3}|(?:rgba?|hsla?|hsv|cmyk)\([^\)]+\)/gi;
const colorNameRegex = /\b\w+\b/g;
const prefixRegex = /^(?:-moz-|-webkit-|-ms-)/g;

class CSSRule {
  constructor(property = '', value = '', enabled = true, system = false) {
    this.property = property;
    this.value = value;
    this.enabled = enabled;
    this.system = system;
    this._validCache = {
      property: '',
      value: '',
      status: false
    };
  }

  toString(prop) {
    if (!this.enabled) return '';
    if (!this.property || !this.value) return '';

    let val = this.value;
    if (prop && prop.env && prop.env === 'builder') {
      val = val.replace(/\b(\d+|\d+\.\d+)(?:vw|vh|vmin|vmax)\b/g, (match, value) =>
        `${parseFloat(value) * 6}px`);
    }
    return `  ${this.property}:${val};\n`;
  }

  isEmpty() {
    return !this.property || !this.value;
  }

  isValid() {
    if (this._validCache.property === this.property && this._validCache.value === this.value) {
      return this._validCache.status;
    }

    if (!this.property || !this.value) {
      return false;
    }

    const prop = this.property.replace(prefixRegex, '');
    if (!CSSRule.isPropertyValid(prop)) {
      return false;
    }

    const div = document.createElement('div');
    div.style[prop] = this.value.replace(/!important/gi, '').replace(/\s+/g, ' ');
    this._validCache.status = prop in div.style && div.style[prop] !== '';
    this._validCache.property = this.property;
    this._validCache.value = this.value;

    return this._validCache.status;
  }

  isColorRelated() {
    return cssProperties.colorProperties.has(this.property.toLowerCase().replace(prefixRegex, ''));
  }

  extractColors() {
    const matches = [];
    this.value.replace(colorRegex, (match, index) => {
      const col = color(match);
      if (col === false) {
        return;
      }

      matches.push({
        index,
        match,
        color: col.cssa()
      });
    });

    this.value.replace(colorNameRegex, (match, index) => {
      if (colorNames.hasOwnProperty(match.toLowerCase())) {
        matches.push({
          index,
          match,
          color: color(match).cssa()
        });
      }
    });

    matches.sort((a, b) => a.index - b.index);

    return matches;
  }

  isInheritable() {
    return cssProperties.inheritableProperties.has(this.property.toLowerCase());
  }

  clone() {
    return new CSSRule(this.property, this.value, this.enabled, this.system);
  }

  serialize() {
    return {
      property: this.property,
      value: this.value,
      enabled: this.enabled,
      system: this.system
    };
  }

  unserialize(obj) {
    this.property = obj.property;
    this.value = obj.value;
    this.enabled = obj.enabled;
    this.system = obj.system;
  }
}

CSSRule.isPropertyForbidden = function(property) {
  return cssProperties.forbiddenProperties.indexOf(property.toLowerCase()) !== -1;
};

CSSRule.isPropertyValid = function(property) {
  return cssProperties.validProperties.indexOf(property.toLowerCase()) !== -1;
};

export default CSSRule;
