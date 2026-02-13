import { BaseEntity } from './BaseEntity.js';
import { Vector2D } from '../utils/Vector2D.js';
import { Config } from '../utils/Config.js';

export class Ship extends BaseEntity {
  constructor(x, y, energy = 1.0) {
    super(x, y);
    this.velocity = new Vector2D(0, 0);
    this.rotation = -Math.PI / 2;
    this.energy = energy;
    this.amplitude = 0.5;
    this.phase = Math.random() * Math.PI * 2;
    this.frequency = 0.8;
  }

  update(dt, field) {
    super.update(dt, field);
    this.phase += this.frequency * Math.PI * 2 * dt;
    
    // Default Ship behavior: Apply friction and move by velocity
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.velocity.x *= Config.FRICTION;
    this.velocity.y *= Config.FRICTION;

    // Ships naturally lose a tiny bit of energy
    this.energy = Math.max(0, this.energy - dt * 0.01);
    if (this.energy <= 0) this.alive = false;
  }

  emitExhaust(field, dt, power = 1.0) {
    // power > 0 is forward (exhaust behind), power < 0 is backward (exhaust in front)
    const exhaustAngle = (power > 0) ? this.rotation + Math.PI : this.rotation;
    // Offset slightly so it hits the neighboring grid cells for the gradient
    const dist = 10; 
    const exX = this.position.x + Math.cos(exhaustAngle) * dist;
    const exY = this.position.y + Math.sin(exhaustAngle) * dist;
    
    // Add significant pressure to create a localized gradient
    field.addPressure(exX, exY, Config.EXHAUST_STRENGTH * Math.abs(power) * dt);
  }
}