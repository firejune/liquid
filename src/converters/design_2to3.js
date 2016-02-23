import op from './operations/navBarAddToggle';

export default function convert(json) {
  op(json.design.components);
  json.version = 3;
  return json;
}
