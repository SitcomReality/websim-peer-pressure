import { WaveEntity } from '../simulation/WaveEntity.js';
import { Physics } from '../simulation/Physics.js';

export class EntityManager {
  constructor() {
    this.entities = [];
    this.player = null;
    this.spawnTimer = 0;
  }
  
  createPlayer(x, y) {
    this.player = new WaveEntity(x, y, 2.5, 0.8);
    return this.player;
  }
  
  spawnEntity(x, y) {
    const frequency = 1.5 + Math.random() * 2;
    const amplitude = 0.3 + Math.random() * 0.4;
    this.entities.push(new WaveEntity(x, y, frequency, amplitude));
  }
  
  update(dt, field) {
    // Update player with energy drain
    if (this.player && this.player.alive) {
      this.player.update(dt, field);
      this.player.energy = Math.max(0, this.player.energy - dt * 0.15);
      if (this.player.energy <= 0) {
        this.player.alive = false;
      }
    }
    
    // Update entities with attraction
    const allAlive = this.getAllEntities().filter(e => e.alive);
    for (const entity of this.entities) {
      entity.updateWithAttraction(dt, field, allAlive);
    }
    
    // Check for resonance (reproduction)
    const allEntities = this.player ? [this.player, ...this.entities] : this.entities;
    const newEntities = Physics.checkResonance(allEntities, field);
    this.entities.push(...newEntities);
    
    // Remove dead entities
    this.entities = this.entities.filter(e => e.alive);
    
    // Spawn new entities periodically
    this.spawnTimer += dt;
    if (this.spawnTimer > 8 && this.entities.length < 12) {
      const x = Math.random() * field.width;
      const y = Math.random() * field.height;
      this.spawnEntity(x, y);
      this.spawnTimer = 0;
    }
  }
  
  tryAbsorb(playerPos) {
    if (!this.player || !this.player.alive) return false;
    
    let absorbed = false;
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      const dx = entity.position.x - playerPos.x;
      const dy = entity.position.y - playerPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 30) {
        this.player.energy = Math.min(1.0, this.player.energy + entity.energy * 0.5);
        this.player.amplitude = Math.min(1.2, this.player.amplitude + 0.05);
        this.entities.splice(i, 1);
        absorbed = true;
      }
    }
    return absorbed;
  }
  
  spawnOffspring(x, y, parentEnergy) {
    if (parentEnergy < 0.3) return null;
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 40;
    const newX = x + Math.cos(angle) * dist;
    const newY = y + Math.sin(angle) * dist;
    
    const frequency = 1.5 + Math.random() * 2;
    const amplitude = 0.4 + Math.random() * 0.3;
    const offspring = new WaveEntity(newX, newY, frequency, amplitude);
    offspring.energy = 0.6;
    this.entities.push(offspring);
    
    return offspring;
  }
  
  getAllEntities() {
    return this.player ? [this.player, ...this.entities] : this.entities;
  }
}