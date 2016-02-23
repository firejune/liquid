export default function walk(component, cb) {
  cb(component);

  if (Array.isArray(component.children)) {
    for (let i = 0; i < component.children.length; i++) {
      walk(component.children[i], cb);
    }
  }
}
