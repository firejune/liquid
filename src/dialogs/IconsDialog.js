import Dialog from './Dialog';
import {filter} from 'fuzzaldrin';
import glyphicons from '../config/glyphicons';
import fontAwesome from '../config/font-awesome';

const iconFonts = [{
  name: 'Glyphicons',
  icons: glyphicons,
  prefix: 'glyphicon glyphicon-'
}, {
  name: 'Font Awesome',
  icons: fontAwesome,
  prefix: 'fa fa-'
}];

export default class IconsDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.searchString = '';
    this.iconFont = 0;
    this.searchInput = elem.find('input');
    this.okButton = elem.find('.button.ok');
    this.selectElement = elem.find('select');
    this.searchInput.on('input', this.onSearch.bind(this));
    this.okButton.on('click', this.onOK.bind(this));
    this.selectElement.on('change', this.selectBoxChanged.bind(this));
    elem.on('click', '.icon', this.iconClick.bind(this));
    elem.find('.button.cancel').on('click', this.close.bind(this));
  }

  selectBoxChanged(e) {
    this.iconFont = e.target.value;
    this.resetSearch();
    this.update();
  }

  resetSearch() {
    this.searchString = '';
    this.searchInput.val('');
  }

  open(options) {
    this.resetSearch();
    for (let i = 0; i < iconFonts.length; i++) {
      if (options.selected.match(iconFonts[i].prefix)) {
        this.iconFont = i;
        this.selectElement.val(i);
        break;
      }
    }
    super.open(options);

    this.searchInput.focus();
  }

  onOK() {
    this.options.onSave(this.options.selected);
    this.close();
  }

  iconClick(e) {
    const elem = $(e.currentTarget);
    if (elem.data('lastClickTime') && Date.now() - elem.data('lastClickTime') < 400) {
      if (elem.hasClass('selected')) {
        return this.onOK();
      }
    }

    elem.data('lastClickTime', Date.now());
    elem.siblings().removeClass('selected');
    elem.toggleClass('selected');

    if (elem.hasClass('selected')) {
      this.options.selected = elem.data('id');
      this.okButton.removeClass('disable');
    } else {
      this.options.selected = '';
      this.okButton.addClass('disable');
    }
  }

  onSearch(e) {
    this.searchString = e.target.value.trim();
    this.scheduleUpdate(100);
  }

  update() {
    const holder = this.element.find('.icon-holder');
    let icons = iconFonts[this.iconFont].icons;
    const prefix = iconFonts[this.iconFont].prefix;

    if (this.searchString.length) {
      icons = filter(icons, this.searchString);
    }

    let isSelectedIcon = false;
    holder.html(icons.map(r => {
      r = prefix + r;
      let selected = '';
      if (r === this.options.selected) {
        selected = 'selected';
        isSelectedIcon = true;
      }
      return `<div data-id="${r}" class="icon ${selected}">` +
      `\n				<i class="${r}"></i>` +
      `\n				<span>${r}</span>` +
      '\n			</div>';
    }));

    this.okButton.toggleClass('disable', !isSelectedIcon);

    if (isSelectedIcon) {
      holder.find('.selected')[0].scrollIntoViewIfNeeded();
    }
  }
}
