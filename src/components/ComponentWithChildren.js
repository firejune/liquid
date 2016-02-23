import Component from './Component';
import canParentTakeChild from '../helpers/canParentTakeChild';
import parseClipboardRepresentation from '../helpers/parseClipboardRepresentation';
import CheckBoxOption from '../panes/CheckBoxOption';

export default class ComponentWithChildren extends Component {
  constructor() {
    super();
    this.children = [];
    this._instanceCache = {};
    this.defineActions([{
      label: 'Paste Inside',
      action: this.pasteInsideAction.bind(this),
      visible: this.canReceivePaste.bind(this),
      showInContextMenu: true,
      weight: 94
    }]);
  }
  childIndex(child) {
    return this.children.indexOf(child);
  }

  findFirstComponentChild() {
    return this.children[0] || false;
  }

  findNextComponentChild(current) {
    const currentIndex = this.childIndex(current);
    return this.children[currentIndex + 1] || false;
  }

  findPreviousComponentChild(current) {
    const currentIndex = this.childIndex(current);
    return this.children[currentIndex - 1] || false;
  }

  canReceivePaste() {
    const copy = parseClipboardRepresentation(electron.clipboardGetHTML());
    return canParentTakeChild(this, copy);
  }

  pasteInsideAction() {
    const copy = parseClipboardRepresentation(electron.clipboardGetHTML());
    if (!canParentTakeChild(this, copy)) return;

    this.insertLast(copy);
    this.update();

    app.context.history.add({
      name: 'Paste Component',
      undo: () => {
        copy.remove();
        this.update();
      },
      redo: () => {
        this.insertLast(copy);
        this.update();
      }
    });
  }

  insertWithHistory(copy, title = 'Insert Component') {
    if (!canParentTakeChild(this, copy)) return;

    this.insertLast(copy);
    this.update();
    app.context.history.add({
      name: title,
      undo: () => {
        copy.remove();
        this.update();
      },
      redo: () => {
        this.insertLast(copy);
        this.update();
      }
    });
  }

  createOrSelectInstance(Type) {
    const name = Type.name;
    if (this._instanceCache[name]) {
      return this._instanceCache[name];
    }

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof Type) {
        this._instanceCache[name] = this.children[i];
        return this.children[i];
      }
    }

    this._instanceCache[name] = new Type;
    this._instanceCache[name].initialize();
    this._instanceCache[name].fixate();

    return this._instanceCache[name];
  }

  createCheckBoxForSubComponent(property, title, type, insertAction) {
    return new CheckBoxOption({
      label: `Show ${title}`,
      value: [this.properties, property],
      onChange: (val, oldVal) => {
        const instance = this.createOrSelectInstance(type);
        if (val) {
          insertAction(this, instance);
          this.update();
          app.context.history.add({
            name: `Show ${title}`,
            undo: () => {
              this.properties[property] = oldVal;
              instance.remove();
              this.update();
            },
            redo: () => {
              this.properties[property] = val;
              insertAction(this, instance);
              this.update();
            }
          });
        } else {
          const index = this.childIndex(instance);
          instance.remove();
          this.update();
          app.context.history.add({
            name: `Hide ${title}`,
            undo: () => {
              this.properties[property] = oldVal;
              insertAction(this, instance, index);
              this.update();
            },
            redo: () => {
              this.properties[property] = val;
              instance.remove();
              this.update();
            }
          });
        }
      }
    });
  }

  hoverDrag(offset = 10) {
    if (!canParentTakeChild(this, app.draggedComponent)) {
      return this.parent && this.parent.hoverDrag(offset);
    }
    if (!this.isPointWithinOffset(app.canvas.mousePosition, offset) && this.parent) {
      return this.parent.hoverDrag(offset);
    }
    app.canvas.highlight(this);

    const children = this.children;
    if (!children.length) {
      app.dropCall = {
        object: this,
        method: 'insertLast',
        arguments: [app.draggedComponent]
      };
      return true;
    }

    let minDistance = Infinity;
    let closest = null;
    let tmp;

    for (let i = 0; i < children.length; i++) {
      tmp = children[i].distanceToPoint(app.canvas.mousePosition);
      if (tmp < minDistance) {
        minDistance = tmp;
        closest = children[i];
      }
    }

    if (!closest) return;

    let elementToTheLeft = false;
    let elementToTheRight = false;
    let elementToTheTop = false;
    let elementToTheBottom = false;
    let leftDistance = Infinity;
    let bottomDistance = Infinity;
    let rightDistance = Infinity;
    let topDistance = Infinity;
    const centerClosest = closest.x + closest.width / 2;
    let centerChild;

    for (let i = 0; i < children.length; i++) {
      if (children[i] === closest) continue;
      centerChild = children[i].x + children[i].width / 2;
      if (closest.onTheSameRowWith(children[i])) {
        if (centerClosest >= centerChild && closest.x - children[i].x2 < 100) {
          elementToTheLeft = true;
          leftDistance = Math.min(Math.max(closest.x - children[i].x2, 0), leftDistance);
        }
        if (centerChild >= centerClosest && children[i].x - closest.x2 < 100) {
          elementToTheRight = true;
          rightDistance = Math.min(Math.max(children[i].x - closest.x2, 0), rightDistance);
        }
      } else if (closest.onTheSameColumnWith(children[i])) {
        if (closest.y >= children[i].y2 && closest.y - children[i].y2 < 100) {
          elementToTheTop = true;
          topDistance = Math.min(closest.y - children[i].y2, topDistance);
        }
        if (children[i].y >= closest.y2 && children[i].y - closest.y2 < 100) {
          elementToTheBottom = true;
          bottomDistance = Math.min(children[i].y - closest.y2, bottomDistance);
        }
      }
    }

    let hoverOffsetX = 0;
    let hoverOffsetY = 0;
    app.dropCall = {
      object: this,
      method: null,
      arguments: null
    };
    if (closest.distanceToPoint(app.canvas.mousePosition) === 0) {
      hoverOffsetX = Math.min(closest.width / 3, 40);
      hoverOffsetY = Math.min(closest.height / 3, 40);
    }
    if (app.canvas.mousePosition.x <= closest.x + hoverOffsetX) {
      app.dropCall.method = 'insertBefore';
      app.dropCall.arguments = [app.draggedComponent, closest];
      if (elementToTheLeft) {
        app.canvas.drawVerticalLine(
          closest.x - leftDistance / 2,
          closest.y,
          closest.height,
          'left right'
        );
      } else {
        app.canvas.drawVerticalLine(closest.x, closest.y, closest.height, 'left');
      }
    } else if (app.canvas.mousePosition.x >= closest.x2 - hoverOffsetX) {
      app.dropCall.method = 'insertAfter';
      app.dropCall.arguments = [app.draggedComponent, closest];
      if (elementToTheRight) {
        app.canvas.drawVerticalLine(
          closest.x2 + rightDistance / 2,
          closest.y,
          closest.height,
          'left right'
        );
      } else {
        app.canvas.drawVerticalLine(closest.x2, closest.y, closest.height, 'right');
      }
    } else if (app.canvas.mousePosition.y <= closest.y + hoverOffsetY) {
      app.dropCall.method = 'insertBefore';
      app.dropCall.arguments = [app.draggedComponent, closest];
      if (elementToTheTop) {
        app.canvas.drawHorizontalLine(
          closest.x,
          closest.y - topDistance / 2,
          closest.width,
          'top bottom'
        );
      } else {
        app.canvas.drawHorizontalLine(closest.x, closest.y, closest.width, 'top');
      }
    } else if (app.canvas.mousePosition.y >= closest.y2 - hoverOffsetY) {
      app.dropCall.method = 'insertAfter';
      app.dropCall.arguments = [app.draggedComponent, closest];
      if (elementToTheBottom) {
        app.canvas.drawHorizontalLine(
          closest.x,
          closest.y2 + bottomDistance / 2,
          closest.width,
          'top bottom'
        );
      } else {
        app.canvas.drawHorizontalLine(closest.x, closest.y2, closest.width, 'bottom');
      }
    } else {
      app.dropCall = null;
    }
    return true;
  }

  hasChild(type) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof type) return true;
      if (this.children[i].hasChild(type)) return true;
    }
    return false;
  }

  /**
   * @param component
   */
  canTakeChild() {
    return true;
  }

  insertFirst(component) {
    component = this.drop(component);
    this.adoptChild(component);
    this.children.unshift(component);
    return true;
  }

  insertLast(component) {
    component = this.drop(component);
    this.adoptChild(component);
    this.children.push(component);
    return true;
  }

  insertBefore(component, componentToInsertBefore) {
    if (component === componentToInsertBefore) {
      return true;
    }

    const index = this.childIndex(componentToInsertBefore);
    if (index === -1) return false;
    component = this.drop(component);
    this.adoptChild(component);
    this.children.splice(this.children.indexOf(componentToInsertBefore), 0, component);
    return true;
  }

  insertAfter(component, componentToInsertAfter) {
    if (component === componentToInsertAfter) {
      return true;
    }

    const index = this.childIndex(componentToInsertAfter);
    if (index === -1) return false;
    component = this.drop(component);
    this.adoptChild(component);
    this.children.splice(this.children.indexOf(componentToInsertAfter) + 1, 0, component);
    return true;
  }

  insertAt(component, index) {
    if (index > this.children.length) {
      return false;
    }
    component = this.drop(component);
    this.adoptChild(component);
    this.children.splice(index, 0, component);
    return true;
  }

  removeChild(component) {
    component = this.undrop(component);
    if (this.children.length === 0) return false;

    const index = this.children.indexOf(component);
    if (index === -1) return false;

    this.children.splice(index, 1);
    if (component.parent) {
      component.parent = null;
    }
    return true;
  }

  adoptChild(component) {
    if (component.parent) {
      component.parent.removeChild(component);
    }
    component.parent = this;
    return true;
  }

  childUpdate() {}

  childFocus() {}

  beforeDrop() {
    return false;
  }

  drop(component) {
    return component;
  }

  undrop(component) {
    return component;
  }

  remove() {
    if (this.page().focusedComponent && this.page().focusedComponent.isChildOf(this)) {
      if (this.page().isActive()) {
        app.canvas.html.body.focus();
      } else {
        this.page().focusedComponent = this.page().html.body;
      }
    }

    super.remove();
  }

  startUpdate() {
    this.element[0].innerHTML = '';

    const fragment = document.createDocumentFragment();
    if (this.children.length) {
      for (let i = 0; i < this.children.length; i++) {
        fragment.appendChild(this.children[i].update()[0]);
      }
    }

    this.element[0].appendChild(fragment);
    super.startUpdate();
  }

  updateDimensions() {
    super.updateDimensions();
    this.children.forEach(child => child.updateDimensions());
  }

  serialize() {
    const obj = super.serialize();
    obj.children = this.children.map(c => c.serialize());
    return obj;
  }
}
