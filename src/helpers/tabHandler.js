export default function(options) {
  const app = options.app;

  for (const area of options.tabAreas) {
    area.on('mousedown', '.tab', mouseDown);
    area.on('wheel', mouseWheel);
  }

  const hasMultipleAreas = options.tabAreas.length > 1;
  let currentTabArea = '';

  app.on('mouseup', mouseUp);
  app.on('mousemove', mouseMove);
  app.on('resize pane-resize', resetScroll);

  let mouseIsDown;
  let mouseDownPosition;
  let mouseMoveStartPosition;
  let mouseDownNodeLeft;
  let tabBarRightOffset;
  let mouseDownNode;
  let offsetLeft;
  let offsetRight;
  let tabBarLeftOffset;
  let previousSnapPoint;
  let nextSnapPoint;
  let mouseMoved;

  function mouseDown(e) {
    e.preventDefault();
    mouseIsDown = true;
    mouseDownPosition = app.mousePosition.clone();
    mouseMoveStartPosition = app.mousePosition.clone();
    mouseDownNode = e.currentTarget;
    mouseDownNodeLeft = mouseDownNode.getBoundingClientRect().left;
    if (hasMultipleAreas) {
      if ($(mouseDownNode).closest(options.tabAreas[0]).length) {
        currentTabArea = 'left';
      } else {
        currentTabArea = 'right';
      }
    }
    offsetLeft = e.pageX - mouseDownNodeLeft;
    offsetRight = mouseDownNode.getBoundingClientRect().right - e.pageX;

    const rect = e.currentTarget.parentNode.parentNode.getBoundingClientRect();
    tabBarLeftOffset = rect.left;
    tabBarRightOffset = rect.right;
    detectNeighborsForDraggedTab();
    if (options.startDrag) {
      options.startDrag();
    }
  }

  function mouseUp(e) {
    if (!mouseIsDown) {
      return;
    }
    e.preventDefault();
    mouseIsDown = false;
    if (mouseMoved) {
      mouseMoved = false;
      mouseDownNode.classList.remove('dragged');
      mouseDownNode.style.transform = '';
      options.onChange({
        tab: mouseDownNode
      });
    } else {
      options.onClick(e);
    }
    mouseDownNode = null;
    previousSnapPoint = null;
    nextSnapPoint = null;
    if (options.endDrag) {
      options.endDrag();
    }
  }

  function mouseMove() {
    if (!mouseIsDown) return;
    if (mouseDownPosition.distanceTo(app.mousePosition) > 3) {
      let movingLeft = false;
      let movingRight = false;

      if (app.mousePosition.x > mouseMoveStartPosition.x) {
        movingRight = true;
      } else if (app.mousePosition.x < mouseMoveStartPosition.x) {
        movingLeft = true;
      }

      if (app.mousePosition.x - offsetLeft <= tabBarLeftOffset) {
        if (app.mousePosition.x - offsetLeft <= tabBarLeftOffset - 15
          && hasMultipleAreas && movingLeft && currentTabArea === 'right') {
          moveToLeftArea();
          detectNeighborsForDraggedTab();
          mouseMoveStartPosition = app.mousePosition.clone();
        }
        return;
      }

      if (app.mousePosition.x + offsetRight >= tabBarRightOffset) {
        if (app.mousePosition.x + offsetRight >= tabBarRightOffset + 15
          && hasMultipleAreas && movingRight && currentTabArea === 'left') {
          moveToRightArea();
          detectNeighborsForDraggedTab();
          mouseMoveStartPosition = app.mousePosition.clone();
        }
        return;
      }

      mouseMoved = true;
      mouseDownNode.classList.add('dragged');

      if (movingLeft && previousSnapPoint && app.mousePosition.x < previousSnapPoint - 10) {
        const element = mouseDownNode.previousElementSibling;
        element.insertAdjacentElement('beforeBegin', mouseDownNode);
        mouseDownNodeLeft -= element.offsetWidth;
        detectNeighborsForDraggedTab();
        mouseMoveStartPosition = app.mousePosition.clone();
      } else if (movingRight && nextSnapPoint && app.mousePosition.x > nextSnapPoint + 10) {
        const element = mouseDownNode.nextElementSibling;
        element.insertAdjacentElement('afterEnd', mouseDownNode);
        mouseDownNodeLeft += element.offsetWidth;
        detectNeighborsForDraggedTab();
        mouseMoveStartPosition = app.mousePosition.clone();
      }

      mouseDownNode.style.transform =
        `translateX(${app.mousePosition.x - (mouseDownNodeLeft + offsetLeft)}px)`;
    }
  }

  function moveToLeftArea() {
    const scroll = options.tabAreas[0].find('.tab-scroll');
    const rect = scroll[0].getBoundingClientRect();

    tabBarLeftOffset = rect.left;
    tabBarRightOffset = rect.right;
    currentTabArea = 'left';
    scroll.find('.tab-holder').append(mouseDownNode);

    let spaceFromLeft = 0;
    mouseDownNodeLeft = rect.left;
    if (mouseDownNode.previousElementSibling) {
      mouseDownNodeLeft = mouseDownNode.previousElementSibling.getBoundingClientRect().right;
      spaceFromLeft = mouseDownNodeLeft - rect.left;
    }

    const node = mouseDownNode;
    node.classList.add('no-animation');
    node.style.transform =
      `translateX(${rect.width - mouseDownNode.offsetWidth - spaceFromLeft}px)`;

    setTimeout(() => {
      node.classList.remove('no-animation');
    }, 50);

    mouseMoved = true;
  }

  function moveToRightArea() {
    const scroll = options.tabAreas[1].find('.tab-scroll');
    const rect = scroll[0].getBoundingClientRect();

    tabBarLeftOffset = rect.left;
    tabBarRightOffset = rect.right;
    currentTabArea = 'right';
    scroll.find('.tab-holder').prepend(mouseDownNode);
    mouseDownNodeLeft = rect.left;

    const node = mouseDownNode;
    node.classList.add('no-animation');
    node.style.transform = 'translateX(0px)';
    setTimeout(() => {
      node.classList.remove('no-animation');
    }, 50);
    mouseMoved = true;
  }

  function detectNeighborsForDraggedTab() {
    const prev = mouseDownNode.previousElementSibling;
    const next = mouseDownNode.nextElementSibling;

    previousSnapPoint = null;
    nextSnapPoint = null;

    if (prev) {
      previousSnapPoint = prev.getBoundingClientRect().right;
    }

    if (next) {
      nextSnapPoint = next.getBoundingClientRect().left;
    }
  }

  function mouseWheel(e) {
    if (mouseMoved) {
      return;
    }

    const tabScroll = e.currentTarget.firstElementChild;
    const tabHolder = tabScroll.firstElementChild;
    const tabScrollOuterWidth = tabScroll.getBoundingClientRect().width;
    const tabHolderOuterWidth = tabHolder.getBoundingClientRect().width;

    let scrollOffset = tabHolder.scrollOffset || 0;

    if (e.originalEvent.deltaX > 0 || e.originalEvent.deltaY > 0) {
      scrollOffset -= 50;
    } else {
      scrollOffset += 50;
    }

    if (scrollOffset > 0) {
      scrollOffset = 0;
    }

    if (tabScrollOuterWidth > tabHolderOuterWidth) {
      scrollOffset = 0;
    } else if (-scrollOffset + tabScrollOuterWidth > tabHolderOuterWidth) {
      scrollOffset = tabScrollOuterWidth - tabHolderOuterWidth;
    }

    tabHolder.style.transform = `translateX(${scrollOffset}px)`;
    tabHolder.scrollOffset = scrollOffset;
  }

  function resetScroll() {
    for (const area of options.tabAreas) {
      const tabScroll = area[0].firstElementChild;
      const tabHolder = tabScroll.firstElementChild;
      const tabScrollOuterWidth = tabScroll.getBoundingClientRect().width;
      const tabHolderOuterWidth = tabHolder.getBoundingClientRect().width;

      if (tabScrollOuterWidth >= tabHolderOuterWidth) {
        tabHolder.scrollOffset = 0;
        tabHolder.style.transform = '';
      } else if (-tabHolder.scrollOffset + tabScrollOuterWidth > tabHolderOuterWidth) {
        tabHolder.scrollOffset = tabScrollOuterWidth - tabHolderOuterWidth;
        tabHolder.style.transform = `translateX(${tabHolder.scrollOffset}px)`;
      }
    }
  }
}
