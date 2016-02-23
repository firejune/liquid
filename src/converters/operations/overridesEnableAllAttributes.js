import walk from '../../helpers/walk';

export default function overridesEnableAllAttributes(tree) {
  walk(tree, component => {
    const currentOverrides = {};
    if (!component.overrides) return;

    for (const path in component.overrides.css) {
      if (!component.overrides.css[path]) continue;
      currentOverrides[path] = {
        'class': component.overrides.css[path]
      };
    }

    for (const path in component.overrides.ids) {
      if (!component.overrides.ids[path]) continue;
      if (!(path in currentOverrides)) currentOverrides[path] = {};
      currentOverrides[path].id = component.overrides.ids[path];
    }

    component.overrides = currentOverrides;
  });
}
