import op1 from './operations/convertCarouselCaptionToDiv';
import op2 from './operations/fixParagraphAndChildrenClasses';

export default function convert(json) {
  op1(json.design.components);
  op2(json.design.components);
  json.version = 5;
  return json;
}
