import escapeHTML from 'escape-html';
import {html as beautifyHTML} from 'js-beautify';
import escapeInlineStyleContent from './escapeInlineStyleContent';

export default function stringifyParsedTree(tree, beautify = true) {
  if (beautify) {
    return beautifyHTML(walk(tree));
  }
  return walk(tree);
}

function walk(item) {
  if (!item) return '';

  let str = `<${item.tag}`;
  for (let i = 0; i < item.attributes.length; i++) {
    str += ` ${escapeHTML(item.attributes[i].name)}`;
    if (item.attributes[i].value) {
      str += `="${escapeHTML(item.attributes[i].value)}"`;
    }
  }

  if (item.selfclosing) {
    str += ' />';
    return str;
  }

  str += '>';
  if (item.tag === 'style') {
    if (item.children.length === 1) {
      str += escapeInlineStyleContent(item.children[0]);
    }
  } else {
    for (let i = 0; i < item.children.length; i++) {
      if (typeof item.children[i] === 'string') {
        str += escapeHTML(item.children[i]);
        continue;
      }
      str += walk(item.children[i]);
    }
  }
  str += `</${item.tag}>`;

  return str;
}
