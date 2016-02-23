import InlineWrapper from '../components/InlineWrapper';
import InlineCharacter from '../components/InlineCharacter';

export default function componentTreeToArray(component) {
  if (!component) return;
  return walk(component);
}

function walk(component) {
  let results = [component];
  if (component instanceof InlineWrapper) {
    results = [];
  }

  if (component.children && component.children.length) {
    for (let i = 0; i < component.children.length; i++) {
      if (component.children[i] instanceof InlineCharacter
        && !(component.children[i] instanceof InlineWrapper)) {
        continue;
      }
      Array.prototype.push.apply(results, walk(component.children[i]));
    }
  }
  return results;
}
