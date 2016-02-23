const multiSpaceRegex = /\s+/g;
const cssSelectorOperator = /([>+~])/g;
const commaRegex = /\s*,/g;
const invalidSymbols = /[\{\}]+/g;
const noClosingBrace = /\([^\)]+$/;

export default function normalizeCSSSelector(selector) {
  selector = selector
    .replace(cssSelectorOperator, ' $1 ')
    .replace(commaRegex, ', ')
    .replace(multiSpaceRegex, ' ')
    .replace(invalidSymbols, '')
    .trim();

  if (noClosingBrace.test(selector)) {
    selector += ')';
  }

  return selector;
}
