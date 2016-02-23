// import Component from './Component';
import ComponentWithChildren from './ComponentWithChildren';
import ComponentListOption from '../panes/ComponentListOption';
// import SelectOption from '../panes/SelectOption';
import CarouselControls from './CarouselControls';
import CarouselSlides from './CarouselSlides';
import CarouselIndicators from './CarouselIndicators';

export default class Carousel extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.cssClasses.system = 'carousel slide';
    this.attributes['data-ride'] = 'carousel';
    this.defineGroups({
      id: 'slide-items',
      label: 'Slides',
      weight: 9
    });

    this.defineProperties([{
      id: 'automatic',
      label: 'Cycle Automatically',
      type: 'checkbox',
      value: true
    }, {
      id: 'interval',
      label: 'Interval (ms)',
      type: 'textbox',
      value: 500,
      visible: () => this.properties.automatic
    }, {
      id: 'pause',
      label: 'Pause On Hover',
      type: 'checkbox',
      value: true
    }, {
      id: 'wrap',
      label: 'Wrap Slides',
      type: 'checkbox',
      value: true
    }, {
      id: 'keyboard',
      label: 'Keyboard Control',
      type: 'checkbox',
      value: true
    }, {
      id: 'activeSlide',
      label: 'Start Slide Index',
      type: 'textbox',
      group: 'slide-items',
      value: 0
    }]);
  }

  initialize() {
    this.setOverride('/', 'id', app.canvas.generateUniqueID('carousel'));

    const slides = new CarouselSlides;
    slides.initialize();
    slides.fixate();
    this.insertFirst(slides);

    const controls = new CarouselControls;
    controls.initialize();
    controls.fixate();
    this.insertLast(controls);
    this.properties.showIndicators = true;
    this.insertLast(this.createOrSelectInstance(CarouselIndicators));
  }

  getCarouselID() {
    return this.getOverride('/', 'id', '');
  }

  isSlideActive(slide) {
    return this.children[0].childIndex(slide) === this.properties.activeSlide;
  }

  focus() {
    super.focus();

    const slidesGroup = app.optionsPane.getById('slide-items');
    const listOption = new ComponentListOption({
      component: this,
      items: [this.children[0], 'children'],
      addClick: () => {
        const op = this.children[0].addSlideOp();
        op.do();

        this.update();

        app.context.history.add({
          name: 'Add Carousel Slide',
          undo: () => {
            op.undo();
            this.update();
          },
          redo: () => {
            op.do();
            this.update();
          }
        });
      },
      itemRepresentation: item => item.slideName(),
      actions: {
        edit: {
          condition: () => true,
          action: item => item.focus()
        },
        'delete': true
      }
    });
    slidesGroup.add(listOption);

    const carouselOptions = this.getMainOptionsGroup();
    carouselOptions.add(this.createCheckBoxForSubComponent('showIndicators', 'Indicators',
      CarouselIndicators,
      /**
       * @param parent
       * @param child
       * @param [index=-1]
       */
      (parent, child) => {
        parent.insertLast(child);
      }
    ));
  }

  /**
   * @param component
   */
  canTakeChild() {
    return false;
  }

  update() {
    delete this.attributes['data-interval'];
    delete this.attributes['data-pause'];
    delete this.attributes['data-wrap'];
    delete this.attributes['data-keyboard'];

    if (!this.properties.automatic) {
      this.attributes['data-interval'] = 'false';
    } else if (this.properties.interval !== 500) {
      this.attributes['data-interval'] = this.properties.interval;
    }

    if (!this.properties.pause) {
      this.attributes['data-pause'] = 'false';
    }

    if (!this.properties.wrap) {
      this.attributes['data-wrap'] = 'false';
    }

    if (!this.properties.keyboard) {
      this.attributes['data-keyboard'] = 'false';
    }

    return super.update();
  }
}
