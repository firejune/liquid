import Div from './Div';
import Span from './Span';
import textOptions from '../helpers/textOptions';

class Alert extends Div {
  constructor() {
    super();

    this.defineProperties([{
      id: 'style',
      label: 'Style',
      type: 'select',
      value: 'alert-success',
      options: Alert.possibleStyles
    }, {
      id: 'dismissable',
      label: 'Dismissable',
      type: 'checkbox',
      value: false
    }]);

    textOptions.construct(this, {
      includeColor: false
    });
  }

  initialize(txt = '<b>Alert</b> text.') {
    const span = new Span;
    span.initialize(txt);
    span.blacklist = ['link'];

    this.insertFirst(span);
  }

  update() {
    this.cssClasses.system = {};
    this.cssClasses.system.main = `alert ${this.properties.style}`;
    this.attributes.role = 'alert';
    textOptions.update(this);

    super.startUpdate();

    if (this.properties.dismissable) {
      this.element.prepend(
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span></button>'
      );
    }

    return super.finishUpdate();
  }
}

Alert.possibleStyles = [
  { label: 'Success', value: 'alert-success' },
  { label: 'Info', value: 'alert-info' },
  { label: 'Warning', value: 'alert-warning' },
  { label: 'Danger', value: 'alert-danger' }
];

export default Alert;
