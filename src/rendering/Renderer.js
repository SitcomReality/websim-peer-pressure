import { Config } from '../utils/Config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false }); // Performance optimization
    
    // Low-res canvas for the pressure field simulation
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = Config.GRID_SIZE;
    this.offscreenCanvas.height = Config.GRID_SIZE;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    this.offscreenData = this.offscreenCtx.createImageData(Config.GRID_SIZE, Config.GRID_SIZE);

    this.particles = [];
    this.initParticles();
    this.resize();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < Config.PARTICLE_COUNT; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0,
        vy: 0,
        life: Math.random()
      });
    }
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
    const data = this.offscreenData.data;
    const size = Config.GRID_SIZE;
    const neutral = Config.COLOR_NEUTRAL;
    const hot = Config.COLOR_HOT;
    const cold = Config.COLOR_COLD;
    const scale = Config.PRESSURE_SCALE;

    for (let i = 0; i < size * size; i++) {
      const pressure = field.pressure[i] * scale;
      const idx = i * 4;
      
      let r, g, b;
      if (pressure > 0) {
        const t = Math.min(1, pressure);
        r = hot[0] * t + neutral[0] * (1 - t);
        g = hot[1] * t + neutral[1] * (1 - t);
        b = hot[2] * t + neutral[2] * (1 - t);
      } else {
        const t = Math.min(1, -pressure);
        r = cold[0] * t + neutral[0] * (1 - t);
        g = cold[1] * t + neutral[1] * (1 - t);
        b = cold[2] * t + neutral[2] * (1 - t);
      }
      
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
    
    this.offscreenCtx.putImageData(this.offscreenData, 0, 0);
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.width, this.height);
  }

  renderParticles(field, dt) {
    this.ctx.fillStyle = 'rgba(255, 240, 220, 0.25)';
    for (const p of this.particles) {
      const vel = field.getVelocity(p.x, p.y);
      p.vx = p.vx * 0.95 + vel.x * 80 * dt;  // Much slower drift
      p.vy = p.vy * 0.95 + vel.y * 80 * dt;
      
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap and reset
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
      
      this.ctx.fillRect(p.x, p.y, 1.5, 1.5);
    }
  }
  
  renderEntity(entity, isPlayer = false) {
    const x = entity.position.x;
    const y = entity.position.y;
    const pulse = (Math.sin(entity.phase) + 1) / 2; // 0 to 1
    const intensity = pulse * Math.min(1.0, entity.energy);
    
    if (entity.isNode) {
      // Gentle pulsing rings for nodes
      const nodeRadius = 18 + intensity * 8;
      this.ctx.strokeStyle = `rgba(255, 220, 180, ${0.15 + intensity * 0.25})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Inner glow
      const nodeGlow = this.ctx.createRadialGradient(x, y, 0, x, y, nodeRadius * 0.6);
      nodeGlow.addColorStop(0, `rgba(255, 230, 200, ${0.3 + intensity * 0.2})`);
      nodeGlow.addColorStop(1, 'rgba(255, 230, 200, 0)');
      this.ctx.fillStyle = nodeGlow;
      this.ctx.beginPath();
      this.ctx.arc(x, y, nodeRadius * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
      return;
    }

    const baseRadius = 12;
    const radius = baseRadius + intensity * 10;
    
    if (isPlayer) {
      // Warning glow when energy is low
      const isLowEnergy = entity.energy < Config.ENERGY_WARNING;
      const warningPulse = isLowEnergy ? (Math.sin(entity.phase * 3) + 1) / 2 : 0;
      
      // Outer warning ring
      if (isLowEnergy) {
        const warningGrad = this.ctx.createRadialGradient(x, y, radius, x, y, radius + 15);
        warningGrad.addColorStop(0, `rgba(255, 160, 100, ${warningPulse * 0.4})`);
        warningGrad.addColorStop(1, 'rgba(255, 160, 100, 0)');
        this.ctx.fillStyle = warningGrad;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 15, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Main player glow
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 240, 220, ${0.6 + intensity * 0.4})`);
      gradient.addColorStop(0.5, `rgba(255, 220, 180, ${intensity * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Bright core
      this.ctx.fillStyle = `rgba(255, 245, 230, ${0.8 + intensity * 0.2})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Soft pastel colors for entities based on frequency
      const hue = 180 + (entity.frequency * 40); // Blues to purples
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `hsla(${hue}, 60%, 75%, ${0.5 + intensity * 0.3})`);
      gradient.addColorStop(0.6, `hsla(${hue}, 50%, 70%, ${intensity * 0.2})`);
      gradient.addColorStop(1, `hsla(${hue}, 50%, 70%, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Gentle core
      this.ctx.fillStyle = `hsla(${hue}, 70%, 85%, ${0.6 + intensity * 0.2})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}