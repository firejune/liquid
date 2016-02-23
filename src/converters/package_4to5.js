import op1 from './operations/createCanBeCopiedFlag';
import op2 from './operations/deletePackageIDProperty';
import op3 from './operations/deletePackageIDOriginFromCSS';

export default function convert(json) {
  op1(json.package.components);
  op2(json.package.components);
  op3(json.package.css);
  json.version = 5;
  return json;
}
