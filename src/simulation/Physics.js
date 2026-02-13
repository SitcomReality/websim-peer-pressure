import { Config } from '../utils/Config.js';
import { WaveEntity } from './WaveEntity.js';

export class Physics {
  static checkResonance(entities, field) {
    const newEntities = [];
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i];
        const e2 = entities[j];
        
        const dx = e2.position.x - e1.position.x;
        const dy = e2.position.y - e1.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Check if entities are close and in phase
        if (dist < 50) {
          const phaseDiff = Math.abs(Math.sin(e1.phase) - Math.sin(e2.phase));
          const combinedPressure = Math.abs(
            field.getPressure(e1.position.x, e1.position.y) +
            field.getPressure(e2.position.x, e2.position.y)
          );
          
          // Resonance condition: must be in phase, high pressure, and rare
          if (phaseDiff < 0.25 && combinedPressure > Config.RESONANCE_THRESHOLD) {
            // Stochastic spawning to prevent exponential growth
            if (Math.random() < 0.005) {
              const midX = (e1.position.x + e2.position.x) / 2;
              const midY = (e1.position.y + e2.position.y) / 2;
              const newFreq = (e1.frequency + e2.frequency) / 2 + (Math.random() - 0.5) * 0.4;
              const newAmp = Math.min(0.8, (e1.amplitude + e2.amplitude) / 2);
              
              const offspring = new WaveEntity(midX, midY, newFreq, newAmp);
              offspring.energy = 0.8;
              newEntities.push(offspring);
            }
          }
        }
      }
    }
    
    return newEntities;
  }
  
  static calculateInterference(entities, x, y) {
    let totalPressure = 0;
    
    for (const entity of entities) {
      const dx = x - entity.position.x;
      const dy = y - entity.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const attenuation = Math.exp(-dist / 100);
        const pressure = Math.sin(entity.phase) * entity.amplitude * attenuation;
        totalPressure += pressure;
      }
    }
    
    return totalPressure;
  }
}