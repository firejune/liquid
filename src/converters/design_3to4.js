import op from './operations/overridesEnableAllAttributes';

export default function convert(json) {
  op(json.design.components);
  json.version = 4;
  return json;
}
