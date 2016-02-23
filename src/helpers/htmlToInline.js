import InlineCharacter from '../components/InlineCharacter';

export default function htmlToInline(html, styles, blacklist = []) {
  const parser = new DOMParser;
  const doc = parser.parseFromString(html, 'text/html');

  let result;
  if (styles) {
    result = parse(
      doc.body, styles.link, styles.bold, styles.italic, styles.strike, styles.underline
    );
  } else {
    result = parse(doc.body);
  }

  for (let j = 0; j < blacklist.length; j++) {
    for (let i = 0; i < result.length; i++) {
      result[i][blacklist[j]] = false;
    }
  }

  return result;
}

function parse(
  node, link = false, bold = false, italic = false, strike = false, underline = false
) {
  const result = [];

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    let tmpStrike = strike;
    let tmpUnderline = underline;
    let tmpBold = bold;
    let tmpItalic = italic;
    let tmpLink = link;

    if (child.nodeName === 'A' && child.href.trim().length > 0) {
      tmpLink = {
        href: child.href.trim(),
        target: child.target || ''
      };
    }
    if (child.nodeName === 'B' || child.nodeName === 'STRONG') {
      tmpBold = true;
    }
    if (child.nodeName === 'I' || child.nodeName === 'EM') {
      tmpItalic = true;
    }
    if (child.nodeName === 'DEL' || child.nodeName === 'STRIKE') {
      tmpStrike = true;
    }
    if (child.nodeName === 'U') {
      tmpUnderline = true;
    }

    if (child.style) {
      if (child.style.fontWeight === 'bold' || child.style.fontWeight === '700') {
        tmpBold = true;
      } else if (child.style.fontWeight === 'normal' || child.style.fontWeight === '400') {
        tmpBold = false;
      }
      if (child.style.fontStyle === 'italic') {
        tmpItalic = true;
      } else if (child.style.fontStyle === 'normal') {
        tmpBold = false;
      }
      if (child.style.textDecoration === 'line-through') {
        tmpStrike = true;
      }
      if (child.style.textDecoration === 'underline') {
        tmpUnderline = true;
      }
      if (child.style.textDecoration === 'none') {
        tmpStrike = false;
        tmpUnderline = false;
      }
    }

    if (child.nodeName === '#text') {
      const chars = child.textContent.replace(/\s+/, ' ').split('');
      let tmp = null;

      for (let j = 0; j < chars.length; j++) {
        tmp = new InlineCharacter(chars[j]);
        tmp.bold = tmpBold;
        tmp.italic = tmpItalic;
        tmp.strike = tmpStrike;
        tmp.underline = tmpUnderline;
        tmp.link = tmpLink;
        result.push(tmp);
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      parse(child, tmpLink, tmpBold, tmpItalic, tmpStrike, tmpUnderline);
    }
  }

  return result;
}
