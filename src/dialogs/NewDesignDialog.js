import ThemeChooserDialog from './ThemeChooserDialog';

export default class NewDesignDialog extends ThemeChooserDialog {
  constructor(elem) {
    super(elem);
    this.template = 'blank';
    this.designName = elem.find('.design-name');
    this.designName.on('input', this.textInput.bind(this));
    this.element.on('click', 'ul li', this.clickTemplate.bind(this));
    this.afterCloseProps = null;
  }

  clickTemplate(e) {
    const target = $(e.currentTarget);
    this.template = target.data('id');
    this.element.find('ul li').removeClass('active');
    target.addClass('active');
  }

  textInput() {
    this.okButton.toggleClass('disable', this.designName.val().trim().length === 0);
  }

  open(props) {
    this.designName.val(props.name || 'Untitled');
    super.open(props);
    this.designName.select();
  }

  onOK() {
    this.afterCloseProps = {
      name: this.designName.val(),
      template: this.template
    };
    this.close();
  }

  afterClose() {
    if (this.afterCloseProps) {
      this.options.onSave(this.afterCloseProps);
    }
    this.afterCloseProps = null;
  }

  update() {
    this.textInput();
    super.update();
  }
}
