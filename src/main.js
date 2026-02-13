import { GameState } from './game/GameState.js';
import { Renderer } from './rendering/Renderer.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.gameState = new GameState(this.renderer.width, this.renderer.height);
    this.lastTime = performance.now();
    this.uiOverlay = document.getElementById('ui-overlay');
    
    window.addEventListener('resize', () => this.handleResize());
    
    // Start audio on first interaction
    const startAudio = () => {
      this.initAudio();
      window.removeEventListener('mousedown', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('mousedown', startAudio);
    window.addEventListener('touchstart', startAudio);

    this.start();
  }
  
  handleResize() {
    this.renderer.resize();
    this.gameState = new GameState(this.renderer.width, this.renderer.height);
  }
  
  update(dt) {
    this.gameState.update(dt);
  }
  
  render(dt) {
    this.renderer.clear();
    this.renderer.renderPressureField(this.gameState.field);
    this.renderer.renderParticles(this.gameState.field, dt);
    
    // Render environmental nodes
    for (const node of this.gameState.entityManager.nodes) {
      this.renderer.renderEntity(node, false);
    }

    // Render entities
    for (const entity of this.gameState.entityManager.entities) {
      this.renderer.renderEntity(entity, false);
    }
    
    // Render player
    if (this.gameState.entityManager.player) {
      this.renderer.renderEntity(this.gameState.entityManager.player, true);
    }
    
    // Update UI
    const stats = this.gameState.getStats();
    const energyPct = (stats.playerEnergy * 100).toFixed(0);
    const beingCount = stats.playerAlive ? stats.entities + 1 : stats.entities;
    
    this.uiOverlay.innerHTML = `
      BEINGS: ${beingCount}<br>
      ENERGY: ${energyPct}%<br>
      ${stats.playerAlive ? 'SPACE/TAP: SPAWN' : 'GAME OVER'}
    `;
  }
  
  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;
    
    this.update(dt);
    this.render(dt);
    this.updateAudio();
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initAudio() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.osc = this.audioCtx.createOscillator();
    this.gain = this.audioCtx.createGain();
    
    this.osc.type = 'sine';
    this.osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
    this.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    
    this.osc.connect(this.gain);
    this.gain.connect(this.audioCtx.destination);
    this.osc.start();
  }

  updateAudio() {
    if (!this.audioCtx || !this.gameState.entityManager.player) return;
    
    const player = this.gameState.entityManager.player;
    const field = this.gameState.field;
    const pressure = Math.abs(field.getPressure(player.position.x, player.position.y));
    
    // Frequency maps to player's internal frequency
    const targetFreq = 100 + player.frequency * 50;
    this.osc.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.1);
    
    // Volume maps to local pressure intensity
    const targetGain = player.alive ? Math.min(0.15, pressure * 0.2) : 0;
    this.gain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.1);
  }
  
  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

new Game();