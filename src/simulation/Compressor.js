import { Emitter } from './Emitter.js';

export class Compressor extends Emitter {
  constructor(x, y) {
    super(x, y, 0.2, 0.8); // Slow, heavy
  }

  update(dt, field) {
    this.age += dt;
    // Compressors emit a constant heavy positive pressure (downward force on field)
    const pressure = this.amplitude * 1.5;
    field.addPressure(this.position.x, this.position.y, pressure * dt * 30);
  }
}