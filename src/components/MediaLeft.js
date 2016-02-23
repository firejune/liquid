import ComponentWithChildren from './ComponentWithChildren';
import Image from './Image';
import linkOptions from '../helpers/linkOptions';

class MediaLeft extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.defineClassSpecificVariables();
    this.defineProperties([{
      id: 'position',
      label: 'Media Position',
      type: 'select',
      value: '',
      options: MediaLeft.possiblePositions
    }, {
      id: 'link',
      label: 'Show Link',
      type: 'checkbox',
      value: true
    }]);
    linkOptions.construct(this, '', [this.properties, 'link']);
  }

  defineClassSpecificVariables() {
    this.className = 'media-left';
  }

  initialize() {
    const img = new Image;
    img.initialize();
    img.cssClasses.parent = 'media-object';
    this.insertFirst(img);
  }

  drop(component) {
    component.cssClasses.parent = 'media-object';
    return component;
  }

  undrop(component) {
    component.cssClasses.parent = '';
    return component;
  }

  update() {
    this.cssClasses.system = this.className;
    if (this.properties.position) {
      this.cssClasses.system += ` ${this.properties.position}`;
    }

    super.startUpdate();

    if (this.properties.link) {
      const a = document.createElement('a');
      linkOptions.updateDOMNode(this, a);
      this.element.children().appendTo(a);
      this.element.append(a);
    }

    return super.finishUpdate();
  }
}

MediaLeft.possiblePositions = [
  { label: 'Default', value: '' },
  { label: 'Top', value: 'media-top' },
  { label: 'Middle', value: 'media-middle' },
  { label: 'Bottom', value: 'media-bottom' }
];

MediaLeft.prettyName = 'Media Left';

export default MediaLeft;
