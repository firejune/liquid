import ComponentWithInlineEditing from './ComponentWithInlineEditing';
import linkOptions from '../helpers/linkOptions';
import textOptions from '../helpers/textOptions';
import Alert from './Alert';
import Paragraph from './Paragraph';

class Anchor extends ComponentWithInlineEditing {
  constructor() {
    super();

    this.inline = true;
    this.blacklist = ['link'];
    this.element = $('<a>');
    linkOptions.construct(this);
    textOptions.construct(this, {
      includeAlignment: false,
      includeNowrap: false
    });
    this.cssClasses.system = {};
  }

  initialize(text = 'Link', url = '#') {
    super.initialize(text);
    this.properties.url = url;
  }

  canTakeChild(c) {
    return super.canTakeChild(c) && !(c instanceof Anchor);
  }

  update() {
    const NavBar = require('./NavBar').default;
    linkOptions.update(this);
    textOptions.update(this);

    super.startUpdate();

    if (this.hasParent(Alert)) {
      this.element.addClass('alert-link');
    }

    if (this.parent instanceof NavBar
      || this.parent instanceof Paragraph
      && this.parent.parent instanceof NavBar) {
      this.element.addClass('navbar-link');
    }

    return super.finishUpdate();
  }
}

Anchor.possibleTargets = [
  { label: 'Default', value: '' },
  { label: 'Blank', value: '_blank' },
  { label: 'Parent', value: '_parent' },
  { label: 'Top', value: '_top' }
];

Anchor.prettyName = 'Link';

export default Anchor;
