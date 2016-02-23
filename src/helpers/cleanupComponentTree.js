export default function cleanupComponentTree(component) {
  if (component.afterDuplicate) {
    component.afterDuplicate();
  }

  if (Array.isArray(component.children)) {
    for (let i = 0; i < component.children.length; i++) {
      cleanupComponentTree(component.children[i]);
    }
  }
}
