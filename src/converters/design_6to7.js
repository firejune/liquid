import op1 from './operations/createCanBeCopiedFlag';
import op2 from './operations/deletePackageIDProperty';
import op3 from './operations/deletePackageIDOriginFromCSS';

export default function convert(json) {
  json.design.assets.css = [{
    name: 'user.css',
    blocks: json.design.css
  }];

  delete json.design.css;
  json.design.assets.js = [];

  for (const page of json.design.pages) {
    op1(page.html);
    op2(page.html);
  }

  for (const css of json.design.assets.css) {
    op3(css.blocks);
  }

  json.version = 7;
  return json;
}
