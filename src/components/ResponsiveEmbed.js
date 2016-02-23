import Component from './Component';
// import ButtonOption from '../panes/ButtonOption';

class ResponsiveEmbed extends Component {
  constructor() {
    super();
    this.element = $('<div><iframe class="embed-responsive-item"></iframe></div>');
    this.iframe = this.element.find('iframe');
    this.defineProperties([{
      id: 'src',
      label: 'Source URL',
      type: 'textbox',
      value: ''
    }, {
      id: 'aspect-ratio',
      label: 'Aspect Ratio',
      type: 'select',
      value: '16by9',
      options: ResponsiveEmbed.possibleRatios
    }, {
      id: 'allowfullscreen',
      label: 'Allow Fullscreen',
      type: 'checkbox',
      value: false
    }]);
  }

  update() {
    this.cssClasses.system = 'embed-responsive';
    this.cssClasses.system += ` embed-responsive-${this.properties['aspect-ratio']}`;
    if (this.properties.src) {
      const src = this.iframe.attr('src');
      if (src !== this.properties.src) {
        this.iframe.attr('src', this.properties.src);
      }
    } else {
      this.iframe.removeAttr('src');
    }

    this.iframe.removeAttr('allowfullscreen');
    if (this.properties.allowfullscreen) {
      this.iframe.attr('allowfullscreen', '');
    }

    return super.update();
  }
}

ResponsiveEmbed.possibleRatios = [
  { label: '16 by 9', value: '16by9' },
  { label: '4 by 3', value: '4by3' }
];

ResponsiveEmbed.prettyName = 'Responsive Embed';

export default ResponsiveEmbed;
