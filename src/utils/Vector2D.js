export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }
  
  sub(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }
  
  mul(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    const len = this.length();
    return len > 0 ? this.mul(1 / len) : new Vector2D(0, 0);
  }
  
  clone() {
    return new Vector2D(this.x, this.y);
  }
}