import { Vector2D } from '../utils/Vector2D.js';
import { Config } from '../utils/Config.js';

export class WaveEntity {
  constructor(x, y, frequency = 2.0, amplitude = 0.5) {
    this.position = new Vector2D(x, y);
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.phase = Math.random() * Math.PI * 2;
    this.age = 0;
    this.alive = true;
    this.energy = 1.0;
  }
  
  update(dt, field) {
    this.age += dt;
    this.phase += this.frequency * Math.PI * 2 * dt;
    
    // Emit pressure wave
    const pressure = Math.sin(this.phase) * this.amplitude;
    field.addPressure(this.position.x, this.position.y, pressure);
    
    // Check for equilibration (death)
    const localPressure = Math.abs(field.getPressure(this.position.x, this.position.y));
    if (localPressure < Config.EQUILIBRATION_THRESHOLD && this.age > 1.0) {
      this.energy -= dt * 0.5;
      if (this.energy <= 0) {
        this.alive = false;
      }
    } else {
      this.energy = Math.min(1.0, this.energy + dt * 0.2);
    }
  }
  
  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }
}