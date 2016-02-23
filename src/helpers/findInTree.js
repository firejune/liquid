import componentTreeToArray from './componentTreeToArray';

export default function findInTree(what, where) {
  if (!Array.isArray(what)) {
    what = [what];
  }

  const list = componentTreeToArray(where);
  const found = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < what.length; j++) {
      if (list[i] instanceof what[j]) {
        found.push(list[i]);
      }
    }
  }
  return found;
}
