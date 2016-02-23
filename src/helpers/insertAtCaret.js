export default function insertAtCaret(elem, value) {
  const scrollTop = elem.scrollTop;
  const val = elem.value;
  const pos = elem.selectionStart;

  elem.value = val.slice(0, pos) + value + val.slice(pos);
  elem.selectionStart = pos + 1;
  elem.selectionEnd = pos + 1;
  elem.scrollTop = scrollTop;
}
