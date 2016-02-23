import Component from './Component';
import IconPreviewOption from '../panes/IconPreviewOption';

export default class Icon extends Component {
  constructor() {
    super();
    this.inline = true;
    this.cssClasses.system = {};
    this.properties.icon = 'glyphicon glyphicon-star';
    this.element = $('<span>');
  }

  usesFontAwesome() {
    return /^fa/.test(this.properties.icon);
  }

  onDoubleClick() {
    app.optionsPane.getById('icon-preview-option').triggerIconChange();
  }

  focus() {
    super.focus();
    const iconOptionsGroup = this.getMainOptionsGroup();
    iconOptionsGroup.add(new IconPreviewOption({
      id: 'icon-preview-option',
      value: [this.properties, 'icon'],
      component: this,
      history: 'Change Icon'
    }));
  }

  update() {
    this.cssClasses.system.icon = this.properties.icon;
    return super.update();
  }
}
