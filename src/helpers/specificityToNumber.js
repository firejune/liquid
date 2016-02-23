export default function specificityToNumber(specificity) {
  const [inline, ids, classes, elements] = specificity.split(',');
  return elements * 1 + classes * 1e3 + ids * 1e6 + inline * 1e9;
}
