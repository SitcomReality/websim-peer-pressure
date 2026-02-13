import { Vector2D } from '../utils/Vector2D.js';

export class BaseEntity {
  constructor(x, y) {
    this.position = new Vector2D(x, y);
    this.age = 0;
    this.alive = true;
  }

  update(dt, field) {
    this.age += dt;
  }

  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }
}