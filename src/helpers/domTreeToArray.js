export default function domTreeToArray(node) {
  if (!node) return;
  return walk(node);
}

function walk(node) {
  let results = [node];
  if (node.nodeName === 'INLINE-WRAPPER') {
    results = [];
  }

  if (node.children && node.children.length) {
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].nodeName === 'INLINE-CHARACTER') {
        continue;
      }
      Array.prototype.push.apply(results, walk(node.children[i]));
    }
  }

  return results;
}
