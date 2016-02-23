import componentTreeToArray from './componentTreeToArray';

export default function findInTreeCallback(cb, where) {
  return componentTreeToArray(where).filter(cb);
}
