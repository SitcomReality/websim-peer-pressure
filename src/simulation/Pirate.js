import { Ship } from './Ship.js';
import { Config } from '../utils/Config.js';
import { Vector2D } from '../utils/Vector2D.js';

export class Pirate extends Ship {
  constructor(x, y) {
    super(x, y, 0.8);
    this.frequency = 1.2; // Aggressive frequency
    this.amplitude = 0.6;
    this.target = null;
  }

  update(dt, field) {
    super.update(dt, field);

    // Dissonant pressure emission (constant erratic pulse)
    const pressure = Math.sin(this.phase * 1.5) * this.amplitude;
    field.addPressure(this.position.x, this.position.y, pressure * dt * 25);

    // Simple AI: Seek target (Player)
    if (this.target && this.target.alive) {
      const dx = this.target.position.x - this.position.x;
      const dy = this.target.position.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 50) {
        const force = 400 * dt;
        this.velocity.x += (dx / dist) * force;
        this.velocity.y += (dy / dist) * force;
        this.rotation = Math.atan2(dy, dx);
      }
    }
  }
}