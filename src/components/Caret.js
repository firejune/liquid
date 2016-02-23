import Component from './Component';

export default class Caret extends Component {
  constructor() {
    super();
    this.inline = true;
    this.cssClasses.system = 'caret';
    this.element = $('<span>');
  }
}
