import MediaLeft from './MediaLeft';

class MediaRight extends MediaLeft {
  constructor() {
    super();
  }

  defineClassSpecificVariables() {
    this.className = 'media-right';
  }
}

MediaRight.prettyName = 'Media Right';

export default MediaRight;
