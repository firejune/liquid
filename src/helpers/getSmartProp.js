export default function getSmartProp(property, def) {
  if (property === undefined) return def;

  if (typeof property === 'function') {
    return property();
  }

  if (Array.isArray(property)) {
    const [obj, prop, def2] = property;
    if (prop in obj) return obj[prop];

    return def2;
  }

  return property;
}
