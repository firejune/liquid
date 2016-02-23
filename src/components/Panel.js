// import CheckBoxOption from '../panes/CheckBoxOption';
import ComponentWithChildren from './ComponentWithChildren';
import PanelBody from './PanelBody';
import PanelHeading from './PanelHeading';
import PanelFooter from './PanelFooter';

class Panel extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');

    this.defineProperties({
      id: 'style',
      label: 'Style',
      type: 'select',
      value: 'panel-default',
      options: Panel.possibleStyles
    });
  }

  initialize() {
    this.properties.showPanelHeading = true;
    this.properties.showPanelBody = true;
    this.properties.showPanelFooter = false;
    this.insertFirst(this.createOrSelectInstance(PanelHeading));
    this.insertLast(this.createOrSelectInstance(PanelBody));
  }

  focus() {
    super.focus();

    const panelOptions = app.optionsPane.getById('panel-options');
    panelOptions.add(this.createCheckBoxForSubComponent('showPanelHeading', 'Panel Heading',
      PanelHeading, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertFirst(child);
      }
    ));

    panelOptions.add(this.createCheckBoxForSubComponent('showPanelBody', 'Panel Body',
      PanelBody, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }

        index = 0;
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i] instanceof PanelHeading) {
            index = i + 1;
            break;
          }
        }
        parent.insertAt(child, index);
      }
    ));

    panelOptions.add(this.createCheckBoxForSubComponent('showPanelFooter', 'Panel Footer',
      PanelFooter, (parent, child, index = -1) => {
        if (index > -1) {
          parent.insertAt(child, index);
          return;
        }
        parent.insertLast(child);
      }
    ));
  }

  canTakeChild(component) {
    return !(component instanceof Panel);
  }

  update() {
    this.cssClasses.system = `panel ${this.properties.style}`;
    return super.update();
  }
}

Panel.possibleStyles = [
  { label: 'Default', value: 'panel-default' },
  { label: 'Primary', value: 'panel-primary' },
  { label: 'Success', value: 'panel-success' },
  { label: 'Info', value: 'panel-info' },
  { label: 'Warning', value: 'panel-warning' },
  { label: 'Danger', value: 'panel-danger' }
];

export default Panel;
