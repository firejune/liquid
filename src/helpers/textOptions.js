const possibleAlignments = [
  { label: 'Default', value: '' },
  { label: 'Left', value: 'text-left' },
  { label: 'Center', value: 'text-center' },
  { label: 'Right', value: 'text-right' },
  { label: 'Justify', value: 'text-justify' }
];

const possibleTransformations = [
  { label: 'None', value: '' },
  { label: 'Lowercase', value: 'text-lowercase' },
  { label: 'Uppercase', value: 'text-uppercase' }
];

/*
const possibleTextProperties = [
  { label: 'Default', value: '' },
  { label: 'Muted', value: 'text-muted' },
  { label: 'Primary', value: 'text-primary' },
  { label: 'Success', value: 'text-success' },
  { label: 'Info', value: 'text-info' },
  { label: 'Warning', value: 'text-warning' },
  { label: 'Danger', value: 'text-danger' }
];
*/

const possibleContextualColors = [
  { label: 'Default', value: '' },
  { label: 'Muted', value: 'text-muted' },
  { label: 'Primary', value: 'text-primary' },
  { label: 'Success', value: 'text-success' },
  { label: 'Info', value: 'text-info' },
  { label: 'Warning', value: 'text-warning' },
  { label: 'Danger', value: 'text-danger' }
];

const possibleContextualBackgrounds = [
  { label: 'Default', value: '' },
  { label: 'Primary', value: 'bg-primary' },
  { label: 'Success', value: 'bg-success' },
  { label: 'Info', value: 'bg-info' },
  { label: 'Warning', value: 'bg-warning' },
  { label: 'Danger', value: 'bg-danger' }
];

function construct(component, options = {}) {
  options = Object.assign({
    includeColor: true,
    includeAlignment: true,
    includeNowrap: true,
    includeTextTransformations: true
  }, options);

  component.defineGroups({
    id: 'text-options',
    label: 'Text Options'
  });

  if (options.includeAlignment) {
    component.defineProperties([{
      id: 'text-alignment',
      label: 'Alignment',
      type: 'select',
      value: '',
      options: possibleAlignments,
      group: 'text-options'
    }]);
  }

  if (options.includeNowrap) {
    component.defineProperties([{
      id: 'text-nowrap',
      label: 'No Wrap',
      type: 'checkbox',
      value: false,
      group: 'text-options'
    }]);
  }

  if (options.includeTextTransformations) {
    component.defineProperties([{
      id: 'text-transformation',
      label: 'Transformations',
      type: 'select',
      value: '',
      options: possibleTransformations,
      group: 'text-options'
    }]);
  }

  if (options.includeColor) {
    component.defineProperties([{
      id: 'contextual-color',
      label: 'Color',
      type: 'select',
      value: '',
      options: possibleContextualColors,
      group: 'text-options'
    }, {
      id: 'contextual-background',
      label: 'Background',
      type: 'select',
      value: '',
      options: possibleContextualBackgrounds,
      group: 'text-options'
    }]);
  }
}

function update(component) {
  delete component.cssClasses.system.nowrap;
  delete component.cssClasses.system.textTransformation;
  delete component.cssClasses.system.textAlignment;
  delete component.cssClasses.system.contextualColor;
  delete component.cssClasses.system.contextualBackground;
  if (component.properties['text-nowrap']) {
    component.cssClasses.system.nowrap = 'text-nowrap';
  }
  if (component.properties['text-transformation']) {
    component.cssClasses.system.textTransformation = component.properties['text-transformation'];
  }
  if (component.properties['text-alignment']) {
    component.cssClasses.system.textAlignment = component.properties['text-alignment'];
  }
  if (component.properties['contextual-color']) {
    component.cssClasses.system.contextualColor = component.properties['contextual-color'];
  }
  if (component.properties['contextual-background']) {
    component.cssClasses.system.contextualBackground =
      component.properties['contextual-background'];
  }
}

export default {construct, update};
