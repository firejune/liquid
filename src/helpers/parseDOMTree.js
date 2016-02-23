const selfClosingElements = new Set([
  'AREA', 'BASE', 'BASEFONT', 'BR', 'COL', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM'
]);

export default function parseDOMTree(node, page, options) {
  return walk(node, page, options);
}

function walk(node, page, options = {}) {
  const attr = node.attributes;
  if (attr['bs-system-element'] && options.removeSystemElements) {
    return null;
  }

  if (attr['bs-hidden']) {
    return null;
  }

  const component = page.domToComponent.get(node);
  const item = {
    tag: node.nodeName.toLowerCase(),
    element: node,
    attributes: [],
    selfclosing: selfClosingElements.has(node.nodeName),
    children: []
  };

  for (let i = 0; i < attr.length; i++) {
    if (attr[i].name === 'bs-system-element' && options.unmarkSystemElements) {
      continue;
    }
    const tmp = {
      name: attr[i].name,
      value: null
    };

    if (attr[i].value) {
      if (component && attr[i].name in component.attributesMask) {
        if (component.attributesMask[attr[i].name] === null) {
          continue;
        }
        tmp.value = component.attributesMask[attr[i].name];
      } else {
        tmp.value = attr[i].value;
      }
    }
    item.attributes.push(tmp);
  }

  if (node.children && node.children.length) {
    let tmpString = '';
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].nodeName === 'INLINE-CHARACTER') {
        tmpString += node.children[i].textContent;
        continue;
      }

      if (tmpString) {
        item.children.push(tmpString);
        tmpString = '';
      }

      let result;
      if (node.children[i].nodeName === 'INLINE-WRAPPER') {
        result = walk(node.children[i].firstChild, page, options);
      } else {
        result = walk(node.children[i], page, options);
      }

      if (result) item.children.push(result);
    }

    if (tmpString) {
      item.children.push(tmpString);
    }
  } else if (node.textContent) {
    item.children.push(node.textContent);
  }

  return item;
}
