import ActiveStyles from './ActiveStyles';
import dragScroll from '../helpers/dragScroll';
import CSSBlock from '../base/CSSBlock';

class CSSEditor extends ActiveStyles {
  constructor(resource) {
    super();
    this.resource = resource;
    this.system = false;
    this.element.removeClass('active-styles');
    this.element.find('.message').text('This file has no CSS styles. Click to create.');
    this.mode = 'css-editor';
    this.blockSizes = [];
    this.lastSpacerIsHighlighted = false;
    this.isDragging = false;
    this.isMousedown = false;
    this.isMouseAbove = false;
    this.mouseDownStartCoordinates = null;
    this.overIndex = -1;
    this.draggedBlockIndex = null;
    this.styleDragGhost = $('#style-drag');
    this.content = this.element.find('.content');
    this.contentNode = this.content[0];
    this.mouseupListener = this.mouseup.bind(this);
    this.mousemoveListener = this.mousemove.bind(this);
  }

  bindEventListeners() {
    super.bindEventListeners();

    const dom = this.element;
    dom.on('click', '.message', this.clickNoStylesMessage.bind(this));
    dom.on('click', 'div.spacer', this.clickSpacer.bind(this));
    dom.on('mouseenter', 'div.spacer:not(:last-child)', this.enterSpacer.bind(this));
    dom.on('mouseleave', 'div.spacer:not(:last-child)', this.leaveSpacer.bind(this));
    dom.on('click', '.content', this.clickContent.bind(this));
    dom.on('mousedown', '.css-block .handle', this.mousedownHandle.bind(this));
    dom.on('mouseenter', '.content', this.mouseenter.bind(this));
    dom.on('mouseleave', '.content', this.mouseleave.bind(this));
    app.on('mouseup', this.mouseupListener);
    app.on('mousemove', this.mousemoveListener);
  }

  unbindEventListeners() {
    super.unbindEventListeners();

    app.off('mouseup', this.mouseupListener);
    app.off('mousemove', this.mousemoveListener);
  }

  /**
   * @param component
   */
  componentFocused() {
    this.handlePendingChanges();
    this.resetFocus();
  }

  /**
   * @param component
   */
  componentBlurred() {
    this.handlePendingChanges();
    this.resetFocus();
  }

  getName() {
    return this.resource.name;
  }

  mouseenter() {
    this.isMouseAbove = true;
  }

  mouseleave() {
    this.isMouseAbove = false;
  }

  clickContent(e) {
    if (e.target !== this.content[0]) return;
    this.content.find('div.spacer.highlight').click();
  }

  mousedownHandle(e) {
    const blockNode = e.target.closest('.css-block');
    const block = this.domToCSSItem.get(blockNode);
    if (!block) return;

    this.draggedBlockIndex = this.cssBlocks.indexOf(block);
    this.isMousedown = true;
    this.mouseDownStartCoordinates = app.mousePosition.clone();

    if (this.focus) {
      const focusBlock = this.focus.block;
      this.resetFocus();
      this.refreshBlock(focusBlock);
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  startDrag() {
    const block = this.cssBlocks[this.draggedBlockIndex];
    this.styleDragGhost.text(block.selector).show();
    this.isDragging = true;
    this.cssItemToDOM.get(block).classList.add('is-dragged');
    this.scanCSSBlockSizes();
    this.dragMove();
  }

  stopDrag() {
    dragScroll.reset(this.contentNode);
    this.styleDragGhost.hide();
    this.draggedBlockIndex = null;
    this.isDragging = false;
    this.isMousedown = false;
    this.mouseDownStartCoordinates = null;
    this.overIndex = -1;
    this.content.find('div.spacer.highlight').removeClass('highlight');
    this.element.find('.is-dragged').removeClass('is-dragged');
  }

  dragMove() {
    const rect = this.contentNode.getBoundingClientRect();
    const y = app.mousePosition.y;
    const distanceFromTop = y - rect.top;
    const distanceFromCSSList = distanceFromTop + this.contentNode.scrollTop;

    let index = this.getBlockIndexByY(distanceFromCSSList);
    if (index > -1 && (index === this.draggedBlockIndex || index - 1 === this.draggedBlockIndex)) {
      index = -1;
    }

    if (this.overIndex !== index) {
      if (index >= 0) {
        this.content.find('div.spacer').eq(index).addClass('highlight');
      } else {
        this.content.find('div.spacer.highlight').removeClass('highlight');
      }
      this.overIndex = index;
    }

    this.styleDragGhost[0].style.transform =
      `translate3D(${app.mousePosition.x}px, ${app.mousePosition.y}px, 0)`;

    dragScroll.scroll(this.contentNode, rect, rect, app.mousePosition, {
      topOffset: 50,
      bottomOffset: 50,
      speedUpScrolling: true
    });
  }

  dragEnd() {
    if (!this.isDragging) return;
    if (this.overIndex > -1) {
      const block = this.cssBlocks[this.draggedBlockIndex];
      this.moveBlock(block, this.overIndex);
    }
    this.stopDrag();
  }

  getBlockIndexByY(y) {
    let sum = 0;

    for (let i = 0; i < this.blockSizes.length; i++) {
      if (y < sum + 30) {
        return i;
      }
      sum += this.blockSizes[i].height + 10;
      if (y < sum - 20) {
        return -1;
      }
    }

    return this.blockSizes.length;
  }

  betweenBlocks(y) {
    let sum = 0;
    for (let i = 0; i < this.blockSizes.length; i++) {
      if (y < sum + 10) {
        return i;
      }
      sum += this.blockSizes[i].height + 10;
      if (y < sum) {
        return -1;
      }
    }

    return this.blockSizes.length;
  }

  getLinePosition(index) {
    let sum = 0;
    for (let i = 0; i < index; i++) {
      sum += this.blockSizes[i].height + 10;
    }
    return sum + 5;
  }

  /**
   * @param e
   */
  mousemove() {
    if (!this.isMouseAbove) {
      if (this.lastSpacerIsHighlighted) {
        this.unhighlightLastSpacer();
      }
      if (this.isDragging) {
        this.stopDrag();
      }
      return;
    }

    if (this.isDragging) {
      this.dragMove();
      return;
    }

    if (this.isMousedown) {
      if (this.mouseDownStartCoordinates
        && this.mouseDownStartCoordinates.distanceTo(app.mousePosition) > 3) {
        this.startDrag();
      }
      return;
    }

    if (!this.focus && this.isMouseAfterLastBlock()) {
      this.highlightLastSpacer();
    } else {
      this.unhighlightLastSpacer();
    }
  }

  isMouseAfterLastBlock() {
    const block = this.cssBlocks[this.cssBlocks.length - 1];
    if (!block) return;

    const blockDOM = this.cssItemToDOM.get(block);
    if (!blockDOM) return;

    const rect = blockDOM.getBoundingClientRect();
    return app.mousePosition.y > rect.bottom;
  }

  highlightLastSpacer() {
    if (this.lastSpacerIsHighlighted) return;

    const last = this.element[0].querySelector('div.spacer:last-child');
    if (last) {
      last.classList.add('highlight');
    }
    this.lastSpacerIsHighlighted = true;
  }

  /**
   * @param e
   */
  unhighlightLastSpacer() {
    if (!this.lastSpacerIsHighlighted) return;

    const last = this.element[0].querySelector('div.spacer:last-child');
    if (last) {
      last.classList.remove('highlight');
    }

    this.lastSpacerIsHighlighted = false;
  }

  enterSpacer(e) {
    if (this.focus || this.isDragging) return;
    e.target.classList.add('highlight');
  }

  leaveSpacer(e) {
    if (this.isDragging) return;
    e.target.classList.remove('highlight');
  }

  clickSpacer(e) {
    if (this.focus) return;

    const allSpacers = this.element.find('div.spacer');
    const index = allSpacers.index(e.target);
    const block = new CSSBlock('');

    this.focusNewBlockSelector(block, index);
    this.update();
  }

  /**
   * @param e
   */
  mouseup() {
    this.dragEnd();
  }

  getTargetCSSResource() {
    return this.resource;
  }

  scanCSSBlockSizes() {
    const blockNodes = this.element.find('.css-block').toArray();
    this.blockSizes = blockNodes.map(node => {
      const rect = node.getBoundingClientRect();
      return {
        height: rect.height,
        block: this.domToCSSItem.get(node)
      };
    });
  }

  /**
   * @param e
   */
  clickNoStylesMessage() {
    const block = new CSSBlock('');
    this.focusNewBlockSelector(block, 0);
    this.update();
  }

  moveBlock(block, newIndex) {
    const css = app.context.assets.css.findResourceForBlock(block);
    if (!css) return;

    const oldIndex = css.findIndexForCSSBlock(block);
    if (newIndex > oldIndex) {
      newIndex--;
    }

    css.blocks.splice(oldIndex, 1);
    css.blocks.splice(newIndex, 0, block);

    app.trigger('context-css-changed', app.context);
    app.context.history.add({
      name: 'Delete CSS Block',
      undo: () => {
        css.blocks.splice(newIndex, 1);
        css.blocks.splice(oldIndex, 0, block);
        app.trigger('context-css-changed', app.context);
      },
      redo: () => {
        css.blocks.splice(oldIndex, 1);
        css.blocks.splice(newIndex, 0, block);
        app.trigger('context-css-changed', app.context);
      }
    });
  }

  update() {
    const content = this.content;
    const message = this.element.find('.message');
    this.lastSpacerIsHighlighted = false;

    let cssBlocks = this.resource.blocks;
    this.cssBlocks = cssBlocks;

    if (this.focus && this.focus.type === 'new-selector') {
      cssBlocks = cssBlocks.slice();
      cssBlocks.splice(this.focus.index, 0, this.focus.block);
    }

    if (cssBlocks.length) {
      content.show();
      message.hide();
    } else {
      content.hide().empty();
      message.show();
      return;
    }

    const blocks = cssBlocks.map(this.renderBlock.bind(this));
    const fragment = document.createDocumentFragment();
    let spacer;

    for (let i = 0; i < blocks.length; i++) {
      spacer = document.createElement('div');
      spacer.setAttribute('class', 'spacer');
      fragment.appendChild(spacer);
      fragment.appendChild(blocks[i]);
    }

    spacer = document.createElement('div');
    spacer.setAttribute('class', 'spacer');
    fragment.appendChild(spacer);
    content.html(fragment);
    this.focusContentEditable(content[0]);

    return this.element;
  }
}

export default CSSEditor;
