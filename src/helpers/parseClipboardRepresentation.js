// import getHTMLForNode from './getHTMLForNode';
// import escapeHTML from 'escape-html';
import cleanupComponentTree from './cleanupComponentTree';
// import restoreComponentTree from './restoreComponentTree';

export default function parseClipboardRepresentation(html) {
  const parser = new DOMParser;
  const doc = parser.parseFromString(html, 'text/html');
  const meta = doc.querySelector('head meta[name=json]');

  if (!meta || !meta.content) return null;
  try {
    const restoreComponentTree = require('./restoreComponentTree').default;
    const tree = restoreComponentTree(JSON.parse(meta.content));
    cleanupComponentTree(tree);
    return tree;
  } catch (err) {
    console.error(err);
    return null;
  }
}
