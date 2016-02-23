import Component from './Component';
import ButtonOption from '../panes/ButtonOption';

class Image extends Component {
  constructor() {
    super();
    this.inline = true;
    this.element = $('<img />');
    this.defineProperties([{
      id: 'src',
      label: 'Source URL',
      type: 'textbox',
      value: '',
      weight: 1
    }, {
      id: 'width',
      label: 'Width',
      type: 'textbox',
      value: '',
      weight: 10
    }, {
      id: 'height',
      label: 'Height',
      type: 'textbox',
      value: '',
      weight: 10
    }, {
      id: 'alt',
      label: 'Alt',
      type: 'textbox',
      value: '',
      weight: 10
    }, {
      id: 'style',
      label: 'Style',
      type: 'select',
      value: '',
      options: Image.possibleStyles,
      weight: 10
    }, {
      id: 'responsive',
      label: 'Responsive',
      type: 'checkbox',
      value: false,
      weight: 10
    }]);
  }

  isInstanceOfImageResource(img) {
    return this.properties.src === img.name;
  }

  focus() {
    super.focus();

    const imageGroup = this.getMainOptionsGroup();
    imageGroup.add(new ButtonOption({
      text: 'From Library',
      layout: 'row-right',
      onClick: () => {
        this.triggerImageChange();
      }
    }));

    imageGroup.add('');
  }

  onDoubleClick() {
    this.triggerImageChange();
  }

  triggerImageChange() {
    app.imagesDialog.open({
      selected: this.properties.src,
      onSave: newValue => {
        const oldValue = this.properties.src;
        this.properties.src = newValue;
        this.update();
        app.context.history.add({
          name: 'Change Image Source',
          undo: () => {
            this.properties.src = oldValue;
            this.update();
          },
          redo: () => {
            this.properties.src = newValue;
            this.update();
          }
        });
      }
    });
  }

  update() {
    delete this.attributes.width;
    delete this.attributes.height;
    delete this.attributes.alt;
    delete this.attributes.src;
    delete this.attributesMask.src;

    if (this.properties.src) {
      let src = this.context().transformImageResource(this.properties.src);
      if (!src) {
        src = this.properties.src;
      }
      this.attributesMask.src = this.properties.src;
      this.attributes.src = src;
    }

    if (this.properties.alt) {
      this.attributes.alt = this.properties.alt;
    }

    if (this.properties.width) {
      this.attributes.width = this.properties.width;
    }

    if (this.properties.height) {
      this.attributes.height = this.properties.height;
    }

    this.cssClasses.system = '';
    if (this.properties.style) {
      this.cssClasses.system = this.properties.style;
    }

    if (this.properties.responsive) {
      this.cssClasses.system += ' img-responsive';
    }

    return super.update();
  }
}

Image.possibleStyles = [
  { label: 'Default', value: '' },
  { label: 'Rounded', value: 'img-rounded' },
  { label: 'Circle', value: 'img-circle' },
  { label: 'Thumbnail', value: 'img-thumbnail' }
];

export default Image;
