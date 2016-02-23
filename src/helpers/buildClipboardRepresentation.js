import getHTMLForNode from './getHTMLForNode';
import escapeHTML from 'escape-html';

export default function buildClipboardRepresentation(component) {
  const html = getHTMLForNode(component.element[0], component.page());
  const escaped = escapeHTML(JSON.stringify(component.clone().serialize()));
  const doc = [
    '<html>',
    '			<head>',
    '				<title></title>',
    '				<meta http-equiv="content-type" content="text/html; charset=utf-8">',
    '				<meta name="generator" content="Psyclone Studio">',
    `				<meta name="json" content="${escaped}">`,
    '			</head>',
    '			<body>',
    html,
    '			</body>',
    '			</html>'
  ].join('\n');

  return {
    text: html,
    html: doc
  };
}
