import Paragraph from './Paragraph';

export default class Caption extends Paragraph {
  constructor() {
    super();
    this.element = $('<caption>');
    this.fixate();
  }

  initialize() {
    super.initialize('Table Caption');
  }
}
