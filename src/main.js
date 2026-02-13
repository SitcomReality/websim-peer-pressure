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
    this.start();
  }
  
  handleResize() {
    this.renderer.resize();
    this.gameState = new GameState(this.renderer.width, this.renderer.height);
  }
  
  update(dt) {
    this.gameState.update(dt);
  }
  
  render() {
    this.renderer.clear();
    this.renderer.renderPressureField(this.gameState.field);
    
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
    this.render();
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

new Game();