export default function positionElementNextToPoint(element, point, distance = 10) {
  const rect = element.getBoundingClientRect();

  let arrow = {
    x: 0,
    y: 0,
    direction: ''
  };

  let direction = 'center';
  if (point.y - rect.height - distance > 0) {
    direction = 'above';
    element.style.top = 'auto';
    element.style.bottom = `${window.innerHeight - point.y + distance}px`;
    arrow.y = window.innerHeight - point.y + distance;
    arrow.direction = 'bottom';
  } else if (point.y + rect.height + distance < window.innerHeight) {
    direction = 'below';
    element.style.bottom = 'auto';
    element.style.top = `${point.y + distance}px`;
    arrow.y = point.y + distance;
    arrow.direction = 'top';
  } else if (point.x - rect.width - distance > 0) {
    direction = 'leftof';
    element.style.left = 'auto';
    element.style.right = `${window.innerWidth - point.x + distance}px`;
    arrow.x = window.innerWidth - point.x + distance;
    arrow.direction = 'right';
  } else if (point.x + rect.width + distance < window.innerHeight) {
    direction = 'rightof';
    element.style.right = 'auto';
    element.style.left = `${point.x + distance}px`;
    arrow.x = point.x + distance;
    arrow.direction = 'left';
  }

  if (direction === 'above' || direction === 'below' || direction === 'center') {
    element.style.left = `${point.x - rect.width / 2}px`;
    element.style.right = 'auto';
    arrow.x = point.x - rect.width / 2;
  }

  if (direction === 'leftof' || direction === 'rightof' || direction === 'center') {
    element.style.top = `${point.y - rect.height / 2}px`;
    element.style.bottom = 'auto';
    arrow.y = point.y - rect.height / 2;
  }

  if (direction === 'center') {
    arrow = null;
  }

  return arrow;
}
