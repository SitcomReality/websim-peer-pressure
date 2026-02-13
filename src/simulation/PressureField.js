import { Config } from '../utils/Config.js';

export class PressureField {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.gridSize = Config.GRID_SIZE;
    
    this.cellWidth = width / this.gridSize;
    this.cellHeight = height / this.gridSize;
    
    // Pressure and velocity fields
    this.pressure = new Float32Array(this.gridSize * this.gridSize);
    this.prevPressure = new Float32Array(this.gridSize * this.gridSize);
    this.velocity = new Float32Array(this.gridSize * this.gridSize);
  }
  
  getIndex(x, y) {
    const gx = Math.floor((x / this.width) * this.gridSize);
    const gy = Math.floor((y / this.height) * this.gridSize);
    const cx = Math.max(0, Math.min(this.gridSize - 1, gx));
    const cy = Math.max(0, Math.min(this.gridSize - 1, gy));
    return cy * this.gridSize + cx;
  }
  
  getPressure(x, y) {
    return this.pressure[this.getIndex(x, y)] || 0;
  }

  getVelocity(x, y) {
    const idx = this.getIndex(x, y);
    // Simple 2D velocity estimation from pressure gradient
    const gx = Math.floor((x / this.width) * this.gridSize);
    const gy = Math.floor((y / this.height) * this.gridSize);
    
    if (gx <= 0 || gx >= this.gridSize - 1 || gy <= 0 || gy >= this.gridSize - 1) {
      return { x: 0, y: 0 };
    }

    const vx = (this.pressure[idx + 1] - this.pressure[idx - 1]);
    const vy = (this.pressure[idx + this.gridSize] - this.pressure[idx - this.gridSize]);
    
    return { x: vx, y: vy };
  }
  
  addPressure(x, y, amount) {
    const idx = this.getIndex(x, y);
    this.pressure[idx] += amount;
  }
  
  update(dt) {
    // Sub-step the simulation for stability
    const subSteps = 2;
    const sdt = dt / subSteps;
    const c2 = Config.WAVE_SPEED * Config.WAVE_SPEED;
    const damping = Config.DAMPING;

    for (let s = 0; s < subSteps; s++) {
      for (let y = 1; y < this.gridSize - 1; y++) {
        for (let x = 1; x < this.gridSize - 1; x++) {
          const idx = y * this.gridSize + x;
          
          // Laplacian
          const laplacian = 
            this.pressure[idx - 1] +
            this.pressure[idx + 1] +
            this.pressure[idx - this.gridSize] +
            this.pressure[idx + this.gridSize] -
            4 * this.pressure[idx];
          
          this.velocity[idx] += c2 * laplacian * sdt;
          this.velocity[idx] *= damping;
        }
      }
      
      for (let i = 0; i < this.pressure.length; i++) {
        this.pressure[i] += this.velocity[i] * sdt;
        // Clamp to prevent infinite growth from feedback
        if (this.pressure[i] > 5) this.pressure[i] = 5;
        if (this.pressure[i] < -5) this.pressure[i] = -5;
      }
    }
  }
  
  clear() {
    this.pressure.fill(0);
    this.velocity.fill(0);
  }
}