import { Vector2D } from '../utils/Vector2D.js';
import { Config } from '../utils/Config.js';

export class WaveEntity {
  constructor(x, y, frequency = 0.8, amplitude = 0.5) {
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
    
    // Gentle fade in
    const fadeIn = Math.min(1.0, this.age * 0.8);
    const currentAmp = this.amplitude * (0.6 + this.energy * 0.4) * fadeIn;
    
    const pressure = Math.sin(this.phase) * currentAmp;
    field.addPressure(this.position.x, this.position.y, pressure * dt * 20);
    
    // Very slow natural decay
    this.energy = Math.max(0, this.energy - dt * 0.015);
    if (this.energy <= 0) {
      this.alive = false;
    }
  }
  
  updateWithAttraction(dt, field, entities) {
    this.update(dt, field);
    
    // Gentle attraction to nearby entities
    for (const other of entities) {
      if (other === this || !other.alive) continue;
      
      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0 && dist < 150) {
        const force = 15 / (dist + 10);
        this.position.x += (dx / dist) * force * dt;
        this.position.y += (dy / dist) * force * dt;
      }
    }
  }
  
  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }
}