export default function inlineCompare(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let i = 0; i < left.length; i++) {
    if (!left[i].sameAs(right[i])) {
      return false;
    }
  }

  return true;
}
