import OptionItem from './OptionItem';

class IconPreviewOption extends OptionItem {
  constructor(options) {
    super(options);
    this.iconClass = this.getValue();
    this.element = $(
      '<div class="icon-preview-option">\n			<div class="icon"></div>\n		</div>'
    );
  }

  bindEventListeners() {
    this.element.find('.icon').off('click').on('click', this.onIconClick.bind(this));
  }

  val() {
    return this.iconClass;
  }

  onIconClick() {
    this.triggerIconChange();
  }

  triggerIconChange() {
    app.iconsDialog.open({
      selected: this.iconClass,
      onSave: value => {
        this.iconClass = value;
        this.changeHandler();
        this.update();
      }
    });
  }

  update() {
    super.update();

    this.iconClass = this.getValue();

    const iconElement = this.element.find('.icon');
    iconElement.html(
      `<i class="${this.iconClass}"></i>\n			<span class="title">${this.iconClass}</span>`
    );

    this.bindEventListeners();

    return this.element;
  }
}

export default IconPreviewOption;
