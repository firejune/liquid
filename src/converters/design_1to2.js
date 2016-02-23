export default function convert(json) {
  walk(json.design.components);
  json.version = 2;
  return json;
}

function walk(component) {
  if (component.cssClasses && component.cssClasses.user !== undefined) {
    component.overrides = {
      css: {},
      ids: {}
    };

    if (component.cssClasses.user.trim().length) {
      component.overrides.css['/'] = component.cssClasses.user;
    }

    delete component.cssClasses.user;
  }

  if (Array.isArray(component.children)) {
    for (let i = 0; i < component.children.length; i++) {
      walk(component.children[i]);
    }
  }
}
