import op from './operations/overridesEnableAllAttributes';

export default function convert(json) {
  op(json.package.components);
  json.version = 3;
  return json;
}
