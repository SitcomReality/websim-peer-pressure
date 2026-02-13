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
    this.player = new WaveEntity(x, y, 0.7, 0.6);  // Gentle player frequency
    this.player.energy = 1.0;
    return this.player;
  }

  spawnNode(x, y, freq) {
    const node = new WaveEntity(x, y, freq * 0.4, 0.4);  // Slower nodes
    node.isNode = true;
    node.energy = 2.0;
    this.nodes.push(node);
  }
  
  spawnEntity(x, y, type = null) {
    const frequency = 0.5 + Math.random() * 1.0;  // Slower frequencies
    const amplitude = 0.3 + Math.random() * 0.3;
    
    // Random type if not specified
    if (type === null) {
      const rand = Math.random();
      if (rand < 0.4) type = Config.ENTITY_TYPES.PULSER;
      else if (rand < 0.6) type = Config.ENTITY_TYPES.EMITTER;
      else if (rand < 0.8) type = Config.ENTITY_TYPES.ATTRACTOR;
      else type = Config.ENTITY_TYPES.REPULSOR;
    }
    
    this.entities.push(new WaveEntity(x, y, frequency, amplitude, type));
  }
  
  update(dt, field) {
    // Update nodes (environment)
    for (const node of this.nodes) {
      node.update(dt, field);
    }

    // Update player with gentle mechanics
    if (this.player && this.player.alive) {
      this.player.update(dt, field);
      
      // Calculate local pressure interference
      const localPressure = field.getPressure(this.player.position.x, this.player.position.y);
      const playerPhase = Math.sin(this.player.phase);
      
      // Gentle resonance mechanic
      const alignment = localPressure * playerPhase;
      const isProtected = this.player.age < Config.GRACE_PERIOD;
      
      // Much more forgiving energy system
      let energyDelta = (alignment * 0.2 - Config.ENERGY_DRAIN_BASE) * dt;
      
      // Grace period: can only gain energy
      if (isProtected) {
        energyDelta = Math.max(0, energyDelta);
      }

      this.player.energy = Math.max(0, Math.min(1.2, this.player.energy + energyDelta));

      // Only die if completely drained and not protected
      if (this.player.energy <= 0 && !isProtected) {
        this.player.alive = false;
      }
    }
    
    // Update entities with attraction/repulsion based on frequency
    const allAlive = this.getAllEntities().filter(e => e.alive);
    for (const entity of this.entities) {
      this.updateEntityBehaviors(entity, dt, field, allAlive);
    }
    
    // Check for resonance (reproduction) with safety limits
    if (this.entities.length < Config.MAX_ENTITIES) {
      const allEntitiesForRes = this.player ? [this.player, ...this.entities] : this.entities;
      const newEntities = Physics.checkResonance(allEntitiesForRes, field);
      // Use loop instead of spread to avoid call stack limits
      for (const e of newEntities) {
        if (this.entities.length < Config.MAX_ENTITIES) {
          this.entities.push(e);
        }
      }
    }
    
    // Remove dead entities
    this.entities = this.entities.filter(e => e.alive);
    
    // Gentle periodic spawning
    this.spawnTimer += dt;
    if (this.spawnTimer > 15 && this.entities.length < 6) {
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
      
      if (dist > 0 && dist < 200) {
        // Gentle frequency-based interaction
        const freqDiff = Math.abs(entity.frequency - other.frequency);
        const isHarmonic = freqDiff < Config.HARMONIC_RANGE;
        
        // Softer forces
        const forceDir = isHarmonic ? 1 : -1;
        const forceMagnitude = (isHarmonic ? 12 : 18) / (dist + 30);
        
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
      
      if (dist < 40) {  // Easier absorption range
        const freqDiff = Math.abs(player.frequency - entity.frequency);
        if (freqDiff < Config.HARMONIC_RANGE) {
          // Generous harmonic absorption
          player.energy = Math.min(1.2, player.energy + entity.energy * 0.6);
          player.amplitude = Math.min(1.2, player.amplitude * 1.05);
          this.entities.splice(i, 1);
          absorbed = true;
        } else if (player.energy > entity.energy * 1.2) {
          // Still possible to absorb dissonant entities
          player.energy = Math.min(1.2, player.energy + entity.energy * 0.3);
          this.entities.splice(i, 1);
          absorbed = true;
        }
      }
    }
    return absorbed;
  }
  
  spawnOffspring(x, y, parentEnergy, type = Config.ENTITY_TYPES.PULSER) {
    if (parentEnergy < 0.25) return null;
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 45;
    const newX = x + Math.cos(angle) * dist;
    const newY = y + Math.sin(angle) * dist;
    
    const frequency = 0.5 + Math.random() * 1.0;  // Slower offspring
    const amplitude = 0.35 + Math.random() * 0.25;
    const offspring = new WaveEntity(newX, newY, frequency, amplitude, type);
    offspring.energy = 0.7;
    this.entities.push(offspring);
    
    return offspring;
  }
  
  getAllEntities() {
    return this.player ? [this.player, ...this.entities] : this.entities;
  }
}