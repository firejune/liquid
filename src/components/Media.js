import ComponentWithChildren from './ComponentWithChildren';
import MediaLeft from './MediaLeft';
import MediaRight from './MediaRight';
import MediaBody from './MediaBody';

class Media extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.cssClasses.system = 'media';
  }

  initialize() {
    this.properties.showMediaLeft = true;
    this.properties.showMediaBody = true;
    this.properties.showMediaRight = false;
    this.insertFirst(this.createOrSelectInstance(MediaLeft));
    this.insertLast(this.createOrSelectInstance(MediaBody));
  }

  canTakeChild(child) {
    return child instanceof MediaLeft || child instanceof MediaRight || child instanceof MediaBody;
  }

  focus() {
    super.focus();

    // const media = this;
    const mediaOptions = this.getMainOptionsGroup();
    mediaOptions.add(this.createCheckBoxForSubComponent('showMediaLeft', 'Media Left',
      MediaLeft, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertFirst(child);
      }
    ));

    mediaOptions.add(this.createCheckBoxForSubComponent('showMediaBody', 'Media Body',
      MediaBody, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }

        index = 0;
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i] instanceof MediaRight) {
            index = i;
            break;
          }
          if (parent.children[i] instanceof MediaLeft) {
            index = i + 1;
            break;
          }
        }
        parent.insertAt(child, index);
      }
    ));

    mediaOptions.add(this.createCheckBoxForSubComponent('showMediaRight', 'Media Right',
      MediaRight, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertLast(child);
      }
    ));
  }
}

export default Media;
