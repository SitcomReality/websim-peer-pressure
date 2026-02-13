import { BaseEntity } from './BaseEntity.js';

export class Emitter extends BaseEntity {
  constructor(x, y, frequency = 0.5, amplitude = 0.4) {
    super(x, y);
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt, field) {
    super.update(dt, field);
    this.phase += this.frequency * Math.PI * 2 * dt;
    const pressure = Math.sin(this.phase) * this.amplitude;
    field.addPressure(this.position.x, this.position.y, pressure * dt * 20);
  }
}