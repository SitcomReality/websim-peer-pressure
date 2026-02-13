import { Player } from '../simulation/Player.js';
import { Pirate } from '../simulation/Pirate.js';
import { Emitter } from '../simulation/Emitter.js';
import { Compressor } from '../simulation/Compressor.js';
import { Physics } from '../simulation/Physics.js';
import { Config } from '../utils/Config.js';

export class EntityManager {
  constructor() {
    this.entities = [];
    this.nodes = [];
    this.player = null;
    this.spawnTimer = 0;
  }
  
  createPlayer(x, y) {
    this.player = new Player(x, y);
    return this.player;
  }

  spawnNode(x, y, freq) {
    const node = new Emitter(x, y, freq * 0.3, 0.5);
    node.isNode = true;
    this.nodes.push(node);
  }
  
  spawnEntity(x, y, type = null) {
    if (type === null) {
      const rand = Math.random();
      if (rand < 0.4) type = Config.ENTITY_TYPES.PULSER;
      else if (rand < 0.6) type = Config.ENTITY_TYPES.PIRATE;
      else if (rand < 0.8) type = Config.ENTITY_TYPES.COMPRESSOR;
      else type = Config.ENTITY_TYPES.EMITTER;
    }
    
    let e;
    switch(type) {
      case Config.ENTITY_TYPES.PIRATE: 
        e = new Pirate(x, y);
        e.target = this.player;
        break;
      case Config.ENTITY_TYPES.COMPRESSOR: 
        e = new Compressor(x, y); 
        break;
      default: 
        e = new Emitter(x, y, 0.5 + Math.random(), 0.4); 
    }
    this.entities.push(e);
  }
  
  update(dt, field) {
    for (const node of this.nodes) {
      node.update(dt, field);
    }

    if (this.player && this.player.alive) {
      this.player.update(dt, field);
      
      const localPressure = field.getPressure(this.player.position.x, this.player.position.y);
      const playerPhase = Math.sin(this.player.phase);
      const alignment = localPressure * playerPhase;
      const isProtected = this.player.age < Config.GRACE_PERIOD;
      
      let energyDelta = (alignment * 0.25 - Config.ENERGY_DRAIN_BASE) * dt;
      if (isProtected) energyDelta = Math.max(0, energyDelta);

      this.player.energy = Math.max(0, Math.min(1.2, this.player.energy + energyDelta));
      if (this.player.energy <= 0 && !isProtected) this.player.alive = false;
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
    
    const offspring = new Emitter(newX, newY, 0.5 + Math.random(), 0.4);
    offspring.energy = 0.7;
    this.entities.push(offspring);
    
    return offspring;
  }
  
  getAllEntities() {
    return this.player ? [this.player, ...this.entities] : this.entities;
  }
}