export class WaveEntity {
  constructor(x = 0, y = 0, frequency = 0.6, amplitude = 0.5) {
    this.position = { x, y };
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.phase = Math.random() * Math.PI * 2;
    this.energy = 0.5;
    this.age = 0;
    this.alive = true;
  }

  update(dt, field) {
    this.age += dt;
    this.phase += this.frequency * Math.PI * 2 * dt;
    // Optionally deposit a gentle pressure to the field (kept minimal for safety)
    if (field && typeof field.addPressure === 'function') {
      const pressure = Math.sin(this.phase) * this.amplitude * 0.6;
      field.addPressure(this.position.x, this.position.y, pressure * dt * 12);
    }
  }
}