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
    // Update all entities
    if (this.player && this.player.alive) {
      this.player.update(dt, field);
    }
    
    for (const entity of this.entities) {
      entity.update(dt, field);
    }
    
    // Check for resonance
    const allEntities = this.player ? [this.player, ...this.entities] : this.entities;
    const newEntities = Physics.checkResonance(allEntities, field);
    this.entities.push(...newEntities);
    
    // Remove dead entities
    this.entities = this.entities.filter(e => e.alive);
    
    // Spawn new entities periodically
    this.spawnTimer += dt;
    if (this.spawnTimer > 5 && this.entities.length < 8) {
      const x = Math.random() * field.width;
      const y = Math.random() * field.height;
      this.spawnEntity(x, y);
      this.spawnTimer = 0;
    }
  }
  
  getAllEntities() {
    return this.player ? [this.player, ...this.entities] : this.entities;
  }
}