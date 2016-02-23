import Pane from './Pane.js';
import Component from '../components/Component';
import InlineWrapper from '../components/InlineWrapper';
import ComponentWithChildren from '../components/ComponentWithChildren';
import canParentTakeChild from '../helpers/canParentTakeChild';
import dragScroll from '../helpers/dragScroll';

class OverviewPane extends Pane {
  constructor(elem) {
    super();
    this.element = elem;
    this.content = elem.find('.content');
    this.domNodeToComponent = null;
    this.componentToDomNode = null;
    this.expandedMap = new WeakMap;
    this.element.on('mousedown', 'b', this.mousedownItem.bind(this));

    app.on('mousemove', this.mousemove.bind(this));
    app.on('mouseup', this.mouseup.bind(this));

    this.element.on('click', 'span', this.expandContract.bind(this));
    this.element.on('mouseenter', 'b', this.enterItem.bind(this));
    this.element.on('mouseleave', 'b', this.leaveItem.bind(this));
    this.element.on('mouseenter', () => {
      app.aboveOverview = true;
    }).on('mouseleave', () => {
      app.aboveOverview = false;
    });
    app.on('component-focused', this.markAsFocused.bind(this));
    app.on('component-updated', this.componentUpdated.bind(this));
    app.on('component-blurred', this.markAsNotFocused.bind(this));
    app.on('package-deleted package-created', this.scheduleUpdate.bind(this));
  }

  componentUpdated() {
    if (app.isInlineEditingActive()) {
      return;
    }
    this.scheduleUpdate();
  }

  enterItem(e) {
    const component = this.domNodeToComponent.get(e.target.parentNode);
    app.canvas.highlight(component);
  }

  /**
   * @param e
   */
  leaveItem() {
    app.canvas.removeHighlight();
  }

  mousedownItem(e) {
    this.isMousedown = true;
    this.mousedownStartPosition = app.mousePosition.clone();
    this.clickedComponent = this.domNodeToComponent.get(e.target.parentNode);
  }

  mousemove(e) {
    if (app.isDragging) {
      dragScroll.scroll(
      this.content[0],
      this.dimensions,
      this.contentDimensions,
      app.mousePosition, {
        topOffset: 70
      });
    } else {
      dragScroll.reset(this.content[0]);
    }

    if (!app.aboveOverview) return;

    const target = e.target.nodeName === 'SPAN' ? e.target : e.target.parentNode;
    if (app.isDragging) {
      const overComponent = this.domNodeToComponent.get(target);
      if (this.expandCountdown) {
        clearTimeout(this.expandCountdown);
        this.expandCountdown = null;
      }

      if (!overComponent) {
        this.cleanup();
        return;
      }

      if (overComponent === app.draggedComponent) {
        this.cleanup();
        return;
      }

      if (overComponent.isChildOf(app.draggedComponent)) {
        this.cleanup();
        return;
      }

      const isExpanded = this.expandedMap.get(overComponent) || false;
      const rect = target.getBoundingClientRect();

      let place = 'middle';
      let highlight = false;
      let line = false;

      if (rect.top + 6 > e.pageY) {
        place = 'top';
      } else if (rect.bottom - 6 < e.pageY) {
        place = 'bottom';
      }

      if (place === 'middle') {
        if (overComponent instanceof ComponentWithChildren) {
          if (canParentTakeChild(overComponent, app.draggedComponent)) {
            highlight = true;
            app.dropCall = {
              object: overComponent,
              method: 'insertLast',
              arguments: [app.draggedComponent]
            };
          }

          if (overComponent.children && !isExpanded) {
            this.expandCountdown = setTimeout(() => {
              this.expand(overComponent);
            }, 400);
          }
        }
      }
      if (place === 'top') {
        if (canParentTakeChild(overComponent.parent, app.draggedComponent)) {
          line = true;
          app.dropCall = {
            object: overComponent.parent,
            method: 'insertBefore',
            arguments: [app.draggedComponent, overComponent]
          };
        }
      }
      if (place === 'bottom') {
        if (isExpanded) {
          if (canParentTakeChild(overComponent, app.draggedComponent)) {
            line = true;
            app.dropCall = {
              object: overComponent,
              method: 'insertAt',
              arguments: [app.draggedComponent, 0]
            };
          }
        } else if (canParentTakeChild(overComponent.parent, app.draggedComponent)) {
          line = true;
          app.dropCall = {
            object: overComponent.parent,
            method: 'insertAfter',
            arguments: [app.draggedComponent, overComponent]
          };
        }
      }

      if (line) {
        const coord = place === 'top' ? rect.top : rect.bottom;
        if (this.lineIsShown) {
          if (this.lineIsShown === coord) {
            return;
          }
          this.removeLine();
        }

        this.lineIsShown = coord;

        if (place === 'top') {
          $('<line>').insertBefore(target);
        } else {
          $('<line>').insertAfter(target);
        }
      } else {
        this.removeLine();
      }

      if (highlight) {
        if (this.highlightIsShown) {
          if (this.highlightIsShown === overComponent) {
            return;
          }
          this.removeHighlight();
        }
        this.highlightIsShown = overComponent;
        $(target).find('b').addClass('highlighted');
      } else {
        this.removeHighlight();
      }

      return;
    }

    if (this.clickedComponent && !this.clickedComponent.flags.canBeMoved) {
      return;
    }

    if (this.isMousedown && app.mousePosition.distanceTo(this.mousedownStartPosition) >= 2) {
      const jqt = $(target).find('b');
      const offset = jqt.offset();
      const width = jqt.outerWidth();
      const height = jqt.outerHeight();

      app.dragStart({
        component: this.clickedComponent,
        origin: {
          top: offset.top,
          left: offset.left,
          width,
          height
        }
      });

      if (this.clickedComponent.children) {
        this.contract(this.clickedComponent);
      }
    }
  }

  cleanup() {
    this.removeLine();
    this.removeHighlight();
  }

  mouseup(e) {
    this.isMousedown = false;
    this.removeLine();
    this.removeHighlight();
    if (app.isDragging) {
      this.clickedComponent = null;
      return;
    }

    const clicked = this.clickedComponent;
    this.clickedComponent = null;
    if (!app.aboveOverview) return;

    const element = $(e.target);
    if (element.is('b')) {
      if (e.button === 2) {
        if (clicked) {
          clicked.showContextMenu();
        }
        return;
      }
      if (element.hasClass('focused')) {
        if (clicked) {
          app.canvas.scrollToNode(clicked.element[0]);
        }
        return;
      }
      if (clicked) {
        clicked.focus();
      }
    }
  }

  removeLine() {
    this.lineIsShown = false;
    this.element.find('line').remove();
  }

  removeHighlight() {
    this.highlightIsShown = false;
    this.element.find('.highlighted').removeClass('highlighted');
  }

  expandContract(e) {
    if ($(e.target).is('b')) return;

    const component = this.domNodeToComponent.get(e.currentTarget);
    const status = this.expandedMap.get(component) || false;
    if (status) {
      this.contract(component);
    } else {
      this.expand(component);
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  expand(component) {
    const span = $(this.componentToDomNode.get(component));
    span.next('.subtree').slideDown('fast');
    span.find('i').addClass('down');
    this.expandedMap.set(component, true);
  }

  contract(component) {
    const span = $(this.componentToDomNode.get(component));
    span.next('.subtree').slideUp('fast');
    span.find('i').removeClass('down');
    this.expandedMap.set(component, false);
  }

  markAsFocused(component) {
    this.element.find('.focused').removeClass('focused');

    const node = this.componentToDomNode.get(component);
    const span = $(node);
    if (!node) {
      return;
    }

    span.find('b').addClass('focused');
    const parents = span.parentsUntil('#overview-pane').show();
    const spans = parents.prev();
    for (let i = 0; i < spans.length; i++) {
      if (this.domNodeToComponent.has(spans[i])) {
        this.expandedMap.set(this.domNodeToComponent.get(spans[i]), true);
      }
    }

    spans.find('i').addClass('down');
    node.scrollIntoViewIfNeeded();
  }

  markAsNotFocused(component) {
    $(this.componentToDomNode.get(component)).find('b').removeClass('focused');
  }

  markAsDragged(component) {
    if (!this.componentToDomNode.has(component)) return;
    this.componentToDomNode.get(component).classList.add('dragged');
  }

  markAsNotDragged(component) {
    if (!this.componentToDomNode.has(component)) return;
    this.componentToDomNode.get(component).classList.remove('dragged');
  }

  update() {
    if (!app.context) return;

    const root = document.createDocumentFragment();
    const cache = this.domNodeToComponent = new WeakMap;
    const reverseCache = this.componentToDomNode = new WeakMap;
    walk(app.canvas.html, root);

    function walk(component, tip) {
      const tmp = document.createElement('span');
      const b = document.createElement('b');
      let hasChildren = false;

      b.appendChild(document.createTextNode(component.getFullName()));
      cache.set(tmp, component);
      reverseCache.set(component, tmp);
      tmp.appendChild(b);
      tip.appendChild(tmp);

      if (component.isLocked()) {
        const l = document.createElement('u');
        l.className = 'material-icon lock';
        l.title = 'Element is Locked';
        l.textContent = 'lock_outline';
        tmp.appendChild(l);
      }

      if (component.children && component.children.length) {
        const div = document.createElement('div');
        div.className = 'subtree';
        for (let i = 0; i < component.children.length; i++) {
          if (component.children[i] instanceof Component) {
            walk(component.children[i], div);
            hasChildren = true;
          }
          if (component.children[i] instanceof InlineWrapper) {
            walk(component.children[i].component, div);
            hasChildren = true;
          }
        }
        tip.appendChild(div);
      }

      if (hasChildren) {
        tmp.insertBefore(document.createElement('i'), b);
      }
    }

    const is = root.querySelectorAll('i');
    let component = null;
    let state;
    for (let i = 0; i < is.length; i++) {
      component = cache.get(is[i].parentNode);
      if (this.expandedMap.has(component)) {
        state = this.expandedMap.get(component);
      } else if (i < 2) {
        state = true;
        this.expandedMap.set(component, true);
      } else {
        state = false;
        this.expandedMap.set(component, false);
      }
      if (state) {
        is[i].classList.add('down');
        is[i].parentNode.nextSibling.style.display = 'block';
      } else {
        is[i].classList.remove('down');
        is[i].parentNode.nextSibling.style.display = 'none';
      }
    }

    this.content.empty();
    this.content.append(root);
    if (app.context.page.focusedComponent) {
      this.markAsFocused(app.context.page.focusedComponent);
    }

    return this.element;
  }
}

export default OverviewPane;
