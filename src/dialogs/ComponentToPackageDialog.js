import Dialog from './Dialog';
import escapeHTML from 'escape-html';
import domTreeToArray from '../helpers/domTreeToArray';
import findInTree from '../helpers/findInTree';
import Image from '../components/Image';

export default class ComponentToPackageDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.nameInput = elem.find('#package-name-input');
    this.okButton = elem.find('.button.ok');
    this.okButton.on('click', this.onOK.bind(this));
    this.usedCSS = [];
    this.usedFonts = [];
    this.usedImages = [];
    elem.find('.button.cancel').on('click', this.close.bind(this));
    this.nameInput.on('input', this.onNameInput.bind(this));
    elem.on('change', '.item input[type=checkbox]', this.toggleItem.bind(this));
  }

  /**
   * @param e
   */
  onNameInput() {
    this.okButton.toggleClass('disable', this.nameInput.val().trim().length === 0);
  }

  toggleItem(e) {
    const checkbox = $(e.target);
    const item = checkbox.closest('.item');
    item.toggleClass('checked', e.target.checked);
  }

  open(options) {
    const component = options.component;
    const elements = domTreeToArray(component.element[0]);
    const userCSS = app.context.getUserCSS();
    for (let i = 0; i < userCSS.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        if (userCSS[i].matchesElement(elements[j])) {
          if (this.usedCSS.indexOf(userCSS[i]) === -1) {
            this.usedCSS.push(userCSS[i]);
          }
        }
      }
    }

    for (const css of this.usedCSS) {
      for (const img of app.context.assets.images.getAll()) {
        if (css.isImageUsed(img.name) && this.usedImages.indexOf(img) === -1) {
          this.usedImages.push(img);
        }
      }
    }

    for (const imageComponent of findInTree(Image, component)) {
      for (const img of app.context.assets.images.getAll()) {
        if (imageComponent.isInstanceOfImageResource(img) && this.usedImages.indexOf(img) === -1) {
          this.usedImages.push(img);
        }
      }
    }

    for (const css of this.usedCSS) {
      for (const font of app.context.assets.fonts.getAll()) {
        if (css.isFontUsed(font.name) && this.usedFonts.indexOf(font) === -1) {
          this.usedFonts.push(font);
        }
      }
    }

    this.nameInput.val('');

    super.open(options);

    this.nameInput.focus();
  }

  close() {
    super.close();

    this.usedCSS = [];
    this.usedFonts = [];
    this.usedImages = [];
  }

  afterClose() {
    this.element.find('.css-list').empty();
    this.element.find('.image-list').empty();
    this.element.find('.font-list').empty();
  }

  onOK() {
    const css = [];
    const fonts = [];
    const images = [];
    const that = this;
    this.element.find('.css-list .item.checked').each(function() {
      css.push(that.usedCSS[this.dataset.index]);
    });
    this.element.find('.font-list .item.checked').each(function() {
      fonts.push(that.usedFonts[this.dataset.index]);
    });
    this.element.find('.image-list .item.checked').each(function() {
      images.push(that.usedImages[this.dataset.index]);
    });
    this.options.onSubmit({
      name: this.nameInput.val(),
      fonts,
      images,
      css
    });
    this.close();
  }

  update() {
    this.element.toggleClass('has-css', !!this.usedCSS.length);
    this.element.toggleClass('has-images', !!this.usedImages.length);
    this.element.toggleClass('has-fonts', !!this.usedFonts.length);
    this.element.find('.css-list').html(this.usedCSS.map((css, i) =>
      createCSSItem(css, i)).join(''));
    this.element.find('.image-list').html(this.usedImages.map((img, i) =>
      createImageItem(img, i)).join(''));
    this.element.find('.font-list').html(this.usedFonts.map((font, i) =>
      createFontItem(font, i)).join(''));
  }
}

function createImageItem(image, index) {
  return `<label class="item white-item checked" data-index="${index}">' +
  '<input type="checkbox" checked />${escapeHTML(image.name)}</label>`;
}

function createFontItem(font, index) {
  return `<label class="item white-item checked" data-index="${index}">' +
  '<input type="checkbox" checked />${escapeHTML(font.name)}</label>`;
}

function createCSSItem(block, index) {
  if (!block.rules.length) return '';

  let html = `<label class="item checked" data-index="${index}">' +
  '\n			<div class="left">' +
  '\n				<input type="checkbox" checked />' +
  '\n			</div>' +
  '\n' +
  '\n			<div class="right">`;
  if (block.mediaQuery) {
    html += `\n			<div class="media">' +
    '\n				<div class="open-query"><span>@media ${escapeHTML(block.mediaQuery)}</span> {' +
    '</div>' +
    '\n		`;
  }

  html += `\n		<div class="open-block">' +
  '\n			<span>${escapeHTML(block.selector)}</span> {' +
  '\n		</div>`;

  for (let i = 0; i < block.rules.length; i++) {
    html += `\n			<div class="line">' +
    '<span class="property">${escapeHTML(block.rules[i].property)}</span>: ' +
    '<span class="value">${escapeHTML(block.rules[i].value)};</span></div>' +
    '\n		`;
  }

  html += '<div class="close-block">}</div>';
  if (block.mediaQuery) {
    html += '\n			<div class="close-query">}</div>\n		</div>';
  }

  html += '\n		</div>\n	</label>';
  return html;
}
