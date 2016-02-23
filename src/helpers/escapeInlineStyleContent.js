const endOfTag = /<\s*\//g;

export default function escapeInlineStyleContent(str) {
  return str.replace(endOfTag, '<\\/');
}
