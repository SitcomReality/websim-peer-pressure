import { PressureField } from '../simulation/PressureField.js';
import { EntityManager } from './EntityManager.js';
import { InputHandler } from './InputHandler.js';
import { Config } from '../utils/Config.js';

export class GameState {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.field = new PressureField(width, height);
    this.entityManager = new EntityManager();
    this.input = new InputHandler();
    
    // Create player in center
    this.entityManager.createPlayer(width / 2, height / 2);
    
    // Spawn some initial entities
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.entityManager.spawnEntity(x, y);
    }
  }
  
  update(dt) {
    // Handle player movement
    const movement = this.input.getMovement();
    if (this.entityManager.player && this.entityManager.player.alive) {
      const speed = Config.MOVE_SPEED * dt;
      this.entityManager.player.move(
        movement.x * speed,
        movement.y * speed
      );
      
      // Keep player in bounds
      this.entityManager.player.position.x = Math.max(20, Math.min(this.width - 20, this.entityManager.player.position.x));
      this.entityManager.player.position.y = Math.max(20, Math.min(this.height - 20, this.entityManager.player.position.y));
      
      // Auto-absorb nearby entities
      this.entityManager.tryAbsorb(this.entityManager.player.position);
      
      // Spawn offspring on action press
      if (this.input.consumeAction()) {
        const spawned = this.entityManager.spawnOffspring(
          this.entityManager.player.position.x,
          this.entityManager.player.position.y,
          this.entityManager.player.energy
        );
        if (spawned) {
          this.entityManager.player.energy -= 0.25;
        }
      }
    }
    
    // Update entities
    this.entityManager.update(dt, this.field);
    
    // Update pressure field
    this.field.update(dt);
  }
  
  getStats() {
    return {
      entities: this.entityManager.entities.length,
      playerAlive: this.entityManager.player?.alive || false,
      playerEnergy: this.entityManager.player?.energy.toFixed(2) || 0
    };
  }
}