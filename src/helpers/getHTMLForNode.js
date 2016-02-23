import parseDOMTree from './parseDOMTree';
import stringifyParsedTree from './stringifyParsedTree';

export default function getHTMLForNode(node, page) {
  const parsed = parseDOMTree(node, page, {
    removeSystemElements: true
  });

  return stringifyParsedTree(parsed);
}
