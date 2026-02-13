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

    // Simple AI: Seek target (Player) using exhaust-based movement
    if (this.target && this.target.alive) {
      const dx = this.target.position.x - this.position.x;
      const dy = this.target.position.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const targetRotation = Math.atan2(dy, dx);
      // Gentle rotation towards target
      let angleDiff = targetRotation - this.rotation;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      
      this.rotation += angleDiff * 2.0 * dt;

      if (dist > 60) {
        // Emit exhaust to move forward if roughly facing the player
        if (Math.abs(angleDiff) < 1.0) {
          this.emitExhaust(field, dt, 0.8);
        }
      }

      // Physics integration (matching GameState player logic)
      const fieldVel = field.getVelocity(this.position.x, this.position.y);
      this.velocity.x -= fieldVel.x * Config.PRESSURE_FORCE_MULTIPLIER;
      this.velocity.y -= fieldVel.y * Config.PRESSURE_FORCE_MULTIPLIER;
    }
  }
}