export default {
  save: () => {
    return window.getSelection().baseOffset;
  },
  restore: (element, offset, change = 0) => {
    if (!element) return;

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    offset = Math.min(offset + change, element.textContent.length + change);
    range.setStart(element, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
