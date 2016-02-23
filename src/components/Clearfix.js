import Component from './Component';

export default class Clearfix extends Component {
  constructor() {
    super();
    this.cssClasses.system = 'clearfix';
    this.element = $('<div>');
  }
}
