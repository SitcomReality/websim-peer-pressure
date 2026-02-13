import { Ship } from './Ship.js';
import { Config } from '../utils/Config.js';

export class Player extends Ship {
  constructor(x, y) {
    super(x, y, 1.0);
    this.frequency = 0.7;
    this.isPlayer = true;
  }

  update(dt, field) {
    // Note: No super call to add default pressure emission
    // We only update position and movement logic from Ship
    // We skip the WaveEntity-style automatic pressure addition
    super.update(dt, field);
    
    // Bounds check
    if (this.position.x < 20) { this.position.x = 20; this.velocity.x *= -0.5; }
    if (this.position.x > field.width - 20) { this.position.x = field.width - 20; this.velocity.x *= -0.5; }
    if (this.position.y < 20) { this.position.y = 20; this.velocity.y *= -0.5; }
    if (this.position.y > field.height - 20) { this.position.y = field.height - 20; this.velocity.y *= -0.5; }
  }

  // Capability to emit manual pulses (to be called by Input/State)
  emitAbilityPulse(field, dt, strength = 1.0) {
    const pulse = Math.sin(this.phase) * this.amplitude * strength;
    field.addPressure(this.position.x, this.position.y, pulse * dt * 40);
  }
}