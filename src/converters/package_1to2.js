import op from './operations/navBarAddToggle';

export default function convert(json) {
  op(json.package.components);
  json.version = 2;
  return json;
}
