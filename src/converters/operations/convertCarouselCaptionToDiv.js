import walk from '../../helpers/walk';
import convertInlineEditingToBlock from '../../helpers/convertInlineEditingToBlock';

export default function convertCarouselCaptionToDiv(tree) {
  walk(tree, component => {
    if (component.class === 'CarouselCaption') {
      convertInlineEditingToBlock(component);
      component.properties = {};
    }
  });
}
