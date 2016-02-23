export default class Box {
  updateDimensions(left, top, width, height, zIndex = 0) {
    this.width = width;
    this.height = height;
    this.x = left;
    this.y = top;
    this.x2 = this.x + this.width;
    this.y2 = this.y + this.height;
    this.z = zIndex;
  }

  isPointWithin(point) {
    return point.x >= this.x
      && point.x <= this.x2
      && point.y >= this.y
      && point.y <= this.y2;
  }

  isPointWithinOffset(point, offset) {
    return point.x >= this.x + offset
      && point.x <= this.x2 - offset
      && point.y >= this.y + offset
      && point.y <= this.y2 - offset;
  }

  distanceToPoint(p) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    let dx;
    let dy;
    dx = Math.max(Math.abs(p.x - centerX) - this.width / 2, 0);
    dy = Math.max(Math.abs(p.y - centerY) - this.height / 2, 0);
    return dx * dx + dy * dy;
  }

  onTheSameRowWith(box) {
    return this.y < box.y2 && this.y2 > box.y;
  }

  onTheSameColumnWith(box) {
    return this.x < box.x2 && this.x2 > box.x;
  }
}
