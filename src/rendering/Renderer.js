import { Config } from '../utils/Config.js';
import { Player } from '../simulation/Player.js';
import { Pirate } from '../simulation/Pirate.js';
import { Compressor } from '../simulation/Compressor.js';
import { Emitter } from '../simulation/Emitter.js';

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
  
  renderBarrier(barrier) {
    const phase = performance.now() * 0.001 * barrier.frequency;
    const pulse = (Math.sin(phase) + 1) / 2;
    const intensity = pulse * 0.6 + 0.4;
    
    // Pulsing barrier ring
    this.ctx.strokeStyle = `rgba(255, 100, 100, ${0.3 + intensity * 0.4})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(barrier.x, barrier.y, barrier.radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Inner warning glow
    const grad = this.ctx.createRadialGradient(barrier.x, barrier.y, 0, barrier.x, barrier.y, barrier.radius * 0.7);
    grad.addColorStop(0, `rgba(255, 120, 120, ${intensity * 0.2})`);
    grad.addColorStop(1, 'rgba(255, 80, 80, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(barrier.x, barrier.y, barrier.radius * 0.7, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderEntity(entity, isPlayerFlag = false) {
    // Sanitize coordinates and computed sizes to avoid non-finite canvas calls
    const rawX = (entity && entity.position && entity.position.x !== undefined) ? entity.position.x : 0;
    const rawY = (entity && entity.position && entity.position.y !== undefined) ? entity.position.y : 0;
    const x = Number.isFinite(rawX) ? rawX : 0;
    const y = Number.isFinite(rawY) ? rawY : 0;

    const isPlayer = entity instanceof Player;
    const isPirate = entity instanceof Pirate;
    const isCompressor = entity instanceof Compressor;

    const pulse = (entity.phase !== undefined && Number.isFinite(entity.phase)) ? (Math.sin(entity.phase) + 1) / 2 : 0.7;
    const energy = (entity.energy !== undefined && Number.isFinite(entity.energy)) ? entity.energy : 1.0;
    const intensity = pulse * Math.min(1.0, energy);

    if (entity.isNode) {
      let nodeRadius = 18 + intensity * 8;
      nodeRadius = Number.isFinite(nodeRadius) ? Math.max(0.1, nodeRadius) : 0.1;

      this.ctx.strokeStyle = `rgba(255, 220, 180, ${0.15 + intensity * 0.25})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      const glowRadius = Math.max(0.1, nodeRadius * 0.6);
      const nodeGlow = this.ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      nodeGlow.addColorStop(0, `rgba(255, 230, 200, ${0.3 + intensity * 0.2})`);
      nodeGlow.addColorStop(1, 'rgba(255, 230, 200, 0)');
      this.ctx.fillStyle = nodeGlow;
      this.ctx.beginPath();
      this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      this.ctx.fill();
      return;
    }

    if (isPlayer) {
      // Ensure rotation and velocity exist and are finite
      const rotation = Number.isFinite(entity.rotation) ? entity.rotation : 0;
      const velLen = (entity.velocity && typeof entity.velocity.length === 'function') ? entity.velocity.length() : 0;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(rotation);

      const isLowEnergy = entity.energy < Config.ENERGY_WARNING;
      const warningPulse = isLowEnergy && Number.isFinite(entity.phase) ? (Math.sin(entity.phase * 3) + 1) / 2 : 0;

      // Body shape: sleek elongated triangle/teardrop
      let length = 24 + intensity * 8;
      let width = 12 + intensity * 4;
      length = Number.isFinite(length) ? Math.max(0.1, length) : 0.1;
      width = Number.isFinite(width) ? Math.max(0.1, width) : 0.1;

      // Outer glow
      const bodyGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, length);
      bodyGlow.addColorStop(0, `rgba(255, 240, 220, ${0.4 + intensity * 0.3})`);
      if (isLowEnergy) {
        bodyGlow.addColorStop(0.5, `rgba(255, 100, 50, ${warningPulse * 0.5})`);
      }
      bodyGlow.addColorStop(1, 'rgba(255, 240, 220, 0)');
      this.ctx.fillStyle = bodyGlow;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Sharp ship body
      this.ctx.fillStyle = `rgba(255, 245, 230, ${0.8 + intensity * 0.2})`;
      this.ctx.beginPath();
      this.ctx.moveTo(length * 0.8, 0); // Nose
      this.ctx.lineTo(-length * 0.5, -width * 0.6); // Top back
      this.ctx.lineTo(-length * 0.3, 0); // Indent
      this.ctx.lineTo(-length * 0.5, width * 0.6); // Bottom back
      this.ctx.closePath();
      this.ctx.fill();

      // Thruster flare if moving
      if (velLen > 10) {
        const flareSize = (Math.sin(performance.now() * 0.05) + 1) * 5;
        const safeFlare = Number.isFinite(flareSize) ? Math.max(0.1, flareSize) : 0.1;
        this.ctx.fillStyle = `rgba(180, 220, 255, ${0.4 + intensity * 0.4})`;
        this.ctx.beginPath();
        this.ctx.arc(-length * 0.5, 0, safeFlare, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    } else if (isPirate) {
      // Render Pirate Ship
      const rotation = Number.isFinite(entity.rotation) ? entity.rotation : 0;
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(rotation);
      this.ctx.fillStyle = `rgba(255, 100, 100, ${0.8 + intensity * 0.2})`;
      this.ctx.beginPath();
      this.ctx.moveTo(20, 0);
      this.ctx.lineTo(-10, -10);
      this.ctx.lineTo(-10, 10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    } else {
      const baseRadius = isCompressor ? 20 : 12;
      let radius = baseRadius + intensity * 10;
      radius = Number.isFinite(radius) ? Math.max(0.1, radius) : 0.1;

      let hue = isCompressor ? 0 : 200;
      let saturation = isCompressor ? 80 : 60;

      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, 75%, ${0.5 + intensity * 0.3})`);
      gradient.addColorStop(0.6, `hsla(${hue}, ${saturation - 10}%, 70%, ${intensity * 0.2})`);
      gradient.addColorStop(1, `hsla(${hue}, ${saturation - 10}%, 70%, 0)`);

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