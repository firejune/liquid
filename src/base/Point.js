export default class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Point(this.x, this.y);
  }

  add(x, y) {
    if (x instanceof Point) {
      this.y += x.y;
      this.x += x.x;
      return this;
    }
    this.y += y;
    this.x += x;
    return this;
  }

  subtract(x, y) {
    if (x instanceof Point) {
      this.y -= x.y;
      this.x -= x.x;
      return this;
    }
    this.y -= y;
    this.x -= x;
    return this;
  }

  withinRect(x, y, xx, yy) {
    if (typeof x !== 'number') {
      y = x.top;
      xx = x.right;
      yy = x.bottom;
      x = x.left;
    }
    return this.x >= x && this.x <= xx && this.y >= y && this.y <= yy;
  }

  distanceTo(x, y) {
    if (x instanceof Point) {
      y = x.y;
      x = x.x;
    }
    return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
  }
}
