import Dialog from './Dialog';
import {filter} from 'fuzzaldrin';

export default class ImagesDialog extends Dialog {
  constructor(elem) {
    super(elem);
    this.domToImage = new WeakMap;
    this.searchString = '';
    this.searchInput = elem.find('input');
    this.okButton = elem.find('.button.ok');
    this.importButton = elem.find('.button.import');
    this.searchInput.on('input', this.onSearch.bind(this));
    this.okButton.on('click', this.onOK.bind(this));

    elem.find('.import').on('click', this.importImage.bind(this));
    elem.on('click', '.image', this.imageClick.bind(this));
    elem.find('.button.cancel').on('click', this.close.bind(this));
    app.on('resource-changed', this.resourceChanged.bind(this));
  }

  resourceChanged(type) {
    if (type !== 'image') return;
    if (!this.isVisible()) return;
    this.scheduleUpdate();
  }

  importImage() {
    app.designPane.importImageAction();
  }

  onOK() {
    this.options.onSave(this.options.selected);
    this.close();
  }

  resetSearch() {
    this.searchString = '';
    this.searchInput.val('');
  }

  open(options) {
    this.resetSearch();
    super.open(options);

    this.searchInput.focus();
  }

  imageClick(e) {
    const elem = $(e.currentTarget);
    if (elem.data('lastClickTime') && Date.now() - elem.data('lastClickTime') < 400) {
      if (elem.hasClass('selected')) {
        return this.onOK();
      }
    }
    elem.data('lastClickTime', Date.now());
    elem.siblings().removeClass('selected');
    elem.toggleClass('selected');

    const obj = this.domToImage.get(e.currentTarget);
    if (elem.hasClass('selected')) {
      this.options.selected = obj.name;
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
    const holder = this.element.find('.image-holder');
    let images = app.context.assets.images.getAll();

    if (this.searchString.length) {
      images = filter(images, this.searchString, {
        key: 'name'
      });
    }

    const build = [];
    let isSelectedImage = false;
    for (let i = 0; i < images.length; i++) {
      let selected = '';
      if (images[i].name === this.options.selected) {
        selected = 'selected';
        isSelectedImage = true;
      }

      const tmp = $(
        `<div class="image ${selected}">\n				<i></i>\n				<span></span>\n			</div>`
      );
      tmp.find('i').css('background-image', `url(${images[i].blobURL})`);
      tmp.find('span').text(images[i].name);

      this.domToImage.set(tmp[0], images[i]);
      build.push(tmp);
    }

    this.okButton.toggleClass('disable', !isSelectedImage);
    holder.html(build);

    if (isSelectedImage) {
      holder.find('.selected')[0].scrollIntoViewIfNeeded();
    }
  }
}
