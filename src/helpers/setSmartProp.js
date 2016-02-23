export default function setSmartProp(property, val) {
  if (typeof property === 'function') {
    return property(val);
  }

  if (Array.isArray(property)) {
    const [obj, prop, def] = property;
    if (typeof val === 'undefined') val = def;
    obj[prop] = val;
  }
}
