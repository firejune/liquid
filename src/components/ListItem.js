import ComponentWithInlineEditing from './ComponentWithInlineEditing';

class ListItem extends ComponentWithInlineEditing {
  constructor() {
    super();
    this.element = $('<li>');
  }

  canBeDroppedIn(parent) {
    const List = require('./List').default;
    return super.canBeDroppedIn(parent) && parent instanceof List;
  }

  canTakeChild(child) {
    const List = require('./List').default;
    return super.canTakeChild(child) || child instanceof List;
  }

  initialize(txt = 'List Item') {
    super.initialize(txt);
  }
}

ListItem.prettyName = 'List Item';

export default ListItem;
