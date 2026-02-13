import { Config } from '../utils/Config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  renderPressureField(field) {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pressure = field.getPressure(x, y) * Config.PRESSURE_SCALE;
        const idx = (y * this.width + x) * 4;
        
        const t = Math.max(0, Math.min(1, (pressure + 1) / 2));
        
        if (pressure > 0) {
          // Hot (compression)
          data[idx] = Config.COLOR_HOT[0] * t + Config.COLOR_NEUTRAL[0] * (1 - t);
          data[idx + 1] = Config.COLOR_HOT[1] * t + Config.COLOR_NEUTRAL[1] * (1 - t);
          data[idx + 2] = Config.COLOR_HOT[2] * t + Config.COLOR_NEUTRAL[2] * (1 - t);
        } else {
          // Cold (rarefaction)
          data[idx] = Config.COLOR_COLD[0] * t + Config.COLOR_NEUTRAL[0] * (1 - t);
          data[idx + 1] = Config.COLOR_COLD[1] * t + Config.COLOR_NEUTRAL[1] * (1 - t);
          data[idx + 2] = Config.COLOR_COLD[2] * t + Config.COLOR_NEUTRAL[2] * (1 - t);
        }
        data[idx + 3] = 255;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  renderEntity(entity, isPlayer = false) {
    const x = entity.position.x;
    const y = entity.position.y;
    const intensity = Math.abs(Math.sin(entity.phase)) * entity.energy;
    const radius = 8 + intensity * 12;
    
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    if (isPlayer) {
      gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
      gradient.addColorStop(0.5, `rgba(200, 220, 255, ${intensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
    } else {
      gradient.addColorStop(0, `rgba(150, 200, 255, ${intensity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(100, 150, 200, ${intensity * 0.4})`);
      gradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}