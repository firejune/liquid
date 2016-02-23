import inlineToDOM from './inlineToDOM';

export default function inlineToHTML(inlineElements) {
  const tree = inlineToDOM(inlineElements, true);
  walk(tree);

  const cleanup = tree.querySelectorAll('inline-character, inline-wrapper, [bs-system-element]');
  for (let i = 0, len = cleanup.length; i < len; i++) {
    cleanup[i].parentNode.removeChild(cleanup[i]);
  }

  const tmp = document.createElement('div');
  tmp.appendChild(tree);
  return tmp.innerHTML;
}

function walk(elem) {
  for (let i = 0; i < elem.childNodes.length; i++) {
    const child = elem.childNodes[i];
    if (child.nodeName === 'INLINE-CHARACTER' || child.nodeName === 'INLINE-WRAPPER') {
      for (let j = 0; j < child.childNodes.length; j++) {
        elem.insertBefore(child.childNodes[j], child);
      }
    } else {
      walk(child);
    }
  }
}
