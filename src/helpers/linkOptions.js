// import Anchor from '../components/Anchor';

export function construct(component, group, visible) {
  if (group === undefined) group = '';

  const Anchor = require('../components/Anchor').default;
  component.defineProperties([{
    group,
    visible,
    id: 'url',
    label: 'URL',
    type: 'textbox',
    value: ''
  }, {
    group,
    visible,
    id: 'target',
    label: 'Target',
    type: 'select',
    value: '',
    options: Anchor.possibleTargets
  }]);
}

export function update(component) {
  delete component.attributes.href;
  delete component.attributes.target;

  if (component.properties.url) {
    component.attributes.href = component.properties.url;
  }

  if (component.properties.target) {
    component.attributes.target = component.properties.target;
  }
}

export function updateDOMNode(component, node) {
  if (!component.properties.url) {
    node.removeAttribute('href');
  } else {
    node.setAttribute('href', component.properties.url);
  }

  if (!component.properties.target) {
    node.removeAttribute('taget');
  } else {
    node.setAttribute('target', component.properties.target);
  }
}

export default {construct, update, updateDOMNode};
