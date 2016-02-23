import CSSBlock from '../base/CSSBlock';

export default function restoreCSSList(list, blockProps = {}, ruleProps = {}) {
  return list.map(b => {
    const tmp = new CSSBlock;

    tmp.unserialize(b);

    for (let i = 0; i < tmp.rules.length; i++) {
      for (const k in ruleProps) {
        if (ruleProps.hasOwnProperty(k)) {
          tmp.rules[i][k] = ruleProps[k];
        }
      }
    }

    for (const k in blockProps) {
      if (blockProps.hasOwnProperty(k)) {
        tmp[k] = blockProps[k];
      }
    }
    return tmp;
  });
}
