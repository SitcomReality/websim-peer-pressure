import { Ship } from './Ship.js';
import { Config } from '../utils/Config.js';

export class Player extends Ship {
  constructor(x, y) {
    super(x, y, 1.0);
    this.frequency = 0.7;
    this.isPlayer = true;
  }

  update(dt, field) {
    // Note: We skip WaveEntity-style automatic pressure addition
    // to keep the player "clean" unless they choose to emit.
    super.update(dt, field);
    
    // Energy cost for active existence
    this.energy -= dt * 0.02;

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