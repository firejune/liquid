import equal from 'deep-equal';

export default function inlineToDOM(inlineElements, clone) {
  const LINK = 0;
  const BOLD = 1;
  const ITALIC = 2;
  const UNDERLINE = 3;
  const STRIKE = 4;
  const flags = [false, false, false, false, false];
  const propertyNames = ['link', 'bold', 'italic', 'underline', 'strike'];
  const top = document.createDocumentFragment();

  let context = top;
  let child;

  for (let i = 0; i < inlineElements.length; i++) {
    child = inlineElements[i];
    for (let j = 0; j < flags.length; j++) {
      if (!equal(child[propertyNames[j]], flags[j])) {
        if (flags[j]) {
          let z = flags.length;
          while (z--) {
            if (z < j) break;
            if (flags[z]) {
              context = context.parentNode;
              flags[z] = false;
            }
          }
        }

        if (child[propertyNames[j]]) {
          flags[j] = child[propertyNames[j]];
          let z = flags.length;
          while (z--) {
            if (z === j) break;
            if (flags[z]) {
              context = context.parentNode;
              flags[z] = false;
            }
          }

          let tmp;
          switch (j) {
            case LINK:
              tmp = document.createElement('a');
              tmp.href = child.link.href;
              if (child.link.target) {
                tmp.target = child.link.target;
              }
              break;
            case BOLD:
              tmp = document.createElement('strong');
              break;
            case ITALIC:
              tmp = document.createElement('em');
              break;
            case UNDERLINE:
              tmp = document.createElement('span');
              tmp.style.textDecoration = 'underline';
              break;
            case STRIKE:
              tmp = document.createElement('span');
              tmp.style.textDecoration = 'line-through';
              break;
          }
          context.appendChild(tmp);
          context = tmp;
        }
      }
    }

    if (clone) {
      context.appendChild(child.element[0].cloneNode(true));
    } else {
      context.appendChild(child.element[0]);
    }
  }

  return top;
}
