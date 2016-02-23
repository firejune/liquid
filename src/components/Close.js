import Component from './Component';

export default class Close extends Component {
  constructor() {
    super();
    this.inline = true;
    this.cssClasses.system = 'close';
    this.element = $(
      '<button type="button" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
    );
  }
}
