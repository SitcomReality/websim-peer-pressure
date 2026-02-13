import { WaveEntity } from '../simulation/WaveEntity.js';
import { Physics } from '../simulation/Physics.js';
import { Config } from '../utils/Config.js';

export class EntityManager {
  constructor() {
    this.entities = [];
    this.nodes = []; // Stationary energy sources
    this.player = null;
    this.spawnTimer = 0;
  }
  
  createPlayer(x, y) {
    this.player = new WaveEntity(x, y, 2.0, 0.9);
    return this.player;
  }

  spawnNode(x, y, freq) {
    const node = new WaveEntity(x, y, freq, 0.5);
    node.isNode = true;
    node.energy = 2.0; // Nodes are permanent high-energy
    this.nodes.push(node);
  }
  
  spawnEntity(x, y) {
    const frequency = 1.5 + Math.random() * 2;
    const amplitude = 0.3 + Math.random() * 0.4;
    this.entities.push(new WaveEntity(x, y, frequency, amplitude));
  }
  
  update(dt, field) {
    // Update nodes (environment)
    for (const node of this.nodes) {
      node.update(dt, field);
    }

    // Update player with dynamic interaction
    if (this.player && this.player.alive) {
      this.player.update(dt, field);
      
      // Calculate local pressure interference
      const localPressure = field.getPressure(this.player.position.x, this.player.position.y);
      const playerPhase = Math.sin(this.player.phase);
      
      // Resonance mechanic: gain energy if moving with the wave, lose if against it
      const alignment = localPressure * playerPhase;
      const energyDelta = (alignment * 0.2 - Config.ENERGY_DRAIN_BASE) * dt;
      this.player.energy = Math.max(0, Math.min(1.5, this.player.energy + energyDelta));

      if (this.player.energy <= 0) {
        this.player.alive = false;
      }
    }
    
    // Update entities with attraction/repulsion based on frequency
    const allAlive = this.getAllEntities().filter(e => e.alive);
    for (const entity of this.entities) {
      this.updateEntityBehaviors(entity, dt, field, allAlive);
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
  
  updateEntityBehaviors(entity, dt, field, others) {
    entity.update(dt, field);

    for (const other of others) {
      if (other === entity) continue;
      
      const dx = other.position.x - entity.position.x;
      const dy = other.position.y - entity.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0 && dist < 180) {
        // Frequency-based social physics
        const freqDiff = Math.abs(entity.frequency - other.frequency);
        const isHarmonic = freqDiff < Config.HARMONIC_RANGE;
        
        // Harmonic beings attract, dissonant beings repel
        const forceDir = isHarmonic ? 1 : -1;
        const forceMagnitude = (isHarmonic ? 25 : 40) / (dist + 20);
        
        entity.position.x += (dx / dist) * forceMagnitude * forceDir * dt;
        entity.position.y += (dy / dist) * forceMagnitude * forceDir * dt;
      }
    }
  }

  tryAbsorb(player) {
    if (!player || !player.alive) return false;
    
    let absorbed = false;
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      const dx = entity.position.x - player.position.x;
      const dy = entity.position.y - player.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 35) {
        const freqDiff = Math.abs(player.frequency - entity.frequency);
        if (freqDiff < Config.HARMONIC_RANGE) {
          // Harmonic absorption (Friendly)
          player.energy = Math.min(1.5, player.energy + entity.energy * 0.4);
          player.amplitude = Math.min(1.5, player.amplitude * 1.02);
          this.entities.splice(i, 1);
          absorbed = true;
        } else if (player.energy > entity.energy * 1.5) {
          // Predatory absorption (Dissonant but stronger)
          player.energy = Math.min(1.5, player.energy + entity.energy * 0.2);
          this.entities.splice(i, 1);
          absorbed = true;
        }
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