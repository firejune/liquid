const nodeToTimeout = new WeakMap;
const nodeToAnim = new WeakMap;

function scroll(node, pDimensions, sDimensions, mousePosition, options = {}) {
  if (mousePosition.y < pDimensions.top
    || mousePosition.y > pDimensions.bottom
    || mousePosition.x < pDimensions.left
    || mousePosition.x > pDimensions.right) {
    return reset(node);
  }

  options = Object.assign({
    topOffset: 30,
    leftOffset: 30,
    rightOffset: 30,
    bottomOffset: 30,
    speedUpScrolling: false
  }, options);

  let scrollAmount = 15;
  if (mousePosition.y < pDimensions.top + options.topOffset && node.scrollTop > 0) {
    if (nodeToAnim.get(node) === 'up') return;

    reset(node);
    nodeToAnim.set(node, 'up');
    nodeToTimeout.set(node, setInterval(() => {
      if (node.scrollTop > 0) {
        node.scrollTop -= scrollAmount;
        if (options.speedUpScrolling) scrollAmount *= 1.2;
      } else {
        reset(node);
      }
    }, 80));
  } else if (mousePosition.y > pDimensions.bottom - options.bottomOffset
    && node.scrollTop + sDimensions.height < node.scrollHeight) {
    if (nodeToAnim.get(node) === 'down') return;

    reset(node);
    nodeToAnim.set(node, 'down');
    nodeToTimeout.set(node, setInterval(() => {
      if (node.scrollTop + sDimensions.height < node.scrollHeight) {
        node.scrollTop += scrollAmount;
        if (options.speedUpScrolling) scrollAmount *= 1.2;
      } else {
        reset(node);
      }
    }, 80));
  } else if (mousePosition.x < pDimensions.left + options.leftOffset && node.scrollLeft > 0) {
    if (nodeToAnim.get(node) === 'left') return;
    reset(node);
    nodeToAnim.set(node, 'left');
    nodeToTimeout.set(node, setInterval(() => {
      if (node.scrollLeft > 0) {
        node.scrollLeft -= scrollAmount;
        if (options.speedUpScrolling) scrollAmount *= 1.2;
      } else {
        reset(node);
      }
    }, 80));
  } else if (mousePosition.x > pDimensions.right - options.rightOffset
    && node.scrollLeft + sDimensions.width < node.scrollWidth) {
    if (nodeToAnim.get(node) === 'right') return;
    reset(node);
    nodeToAnim.set(node, 'right');
    nodeToTimeout.set(node, setInterval(() => {
      if (node.scrollLeft + sDimensions.width < node.scrollWidth) {
        node.scrollLeft += scrollAmount;
        if (options.speedUpScrolling) scrollAmount *= 1.2;
      } else {
        reset(node);
      }
    }, 80));
  } else {
    reset(node);
    nodeToAnim.delete(node);
  }
}

function reset(node) {
  if (nodeToTimeout.has(node)) {
    clearInterval(nodeToTimeout.get(node));
    nodeToTimeout.delete(node);
    nodeToAnim.delete(node);
  }
}

export default {scroll, reset};
