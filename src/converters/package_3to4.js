import op1 from './operations/convertCarouselCaptionToDiv';
import op2 from './operations/fixParagraphAndChildrenClasses';

export default function convert(json) {
  op1(json.package.components);
  op2(json.package.components);
  json.version = 4;
  return json;
}
