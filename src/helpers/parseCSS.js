import css from 'css';
import restoreCSSList from './restoreCSSList';

export default function parseCSS(str, blockProps, ruleProps) {
  const result = [];
  walk(result, css.parse(str).stylesheet.rules);
  return restoreCSSList(result, blockProps, ruleProps);
}

function walk(result, arr, block, mediaQuery = false) {
  for (let i = 0; i < arr.length; i++) {
    switch (arr[i].type) {
      case 'media':
        if (/print/.test(arr[i].media)) {
          continue;
        }
        walk(result, arr[i].rules, null, arr[i].media);
        break;

      case 'rule':
        const tmpBlock = {
          mediaQuery,
          selector: arr[i].selectors.join(', '),
          rules: []
        };
        result.push(tmpBlock);
        walk(result, arr[i].declarations, tmpBlock, mediaQuery);
        break;

      case 'declaration':
        block.rules.push({
          property: arr[i].property,
          value: arr[i].value,
          enabled: true,
          system: false
        });
        break;
    }
  }
}
