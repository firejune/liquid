export default function prettyDOMNodeName(element) {
  let name = element.nodeName.toLowerCase();

  if (element.id) {
    name += `#${element.id}`;
  }

  if (element.className.trim().length) {
    name += `.${element.className.trim().replace(/\s+/g, '.')}`;
  }

  return name;
}
