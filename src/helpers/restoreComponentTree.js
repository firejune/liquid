import componentsRoot from '../components/';
const components = componentsRoot.all;

export default function restoreComponentTree(tree) {
  return walkComponentTree(tree, null);
}

function walkComponentTree(component, parent) {
  const instance = new components[component.class];
  instance.unserialize(component);

  if (parent) {
    parent.insertLast(instance);
  }

  if (Array.isArray(component.children)) {
    for (let i = 0; i < component.children.length; i++) {
      walkComponentTree(component.children[i], instance);
    }
  }

  return instance;
}
