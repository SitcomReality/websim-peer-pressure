export const Config = {
  // Simulation
  GRID_SIZE: 128,
  TIME_STEP: 0.008, // Smaller fixed time step for stability
  WAVE_SPEED: 45,   // Reduced for stability at 60fps
  DAMPING: 0.98,    // Increased damping to prevent blowouts
  
  // Entities
  PLAYER_AMPLITUDE: 0.6,
  ENTITY_PULSE_FREQ: 2.0,
  RESONANCE_THRESHOLD: 1.0,
  ENERGY_DRAIN_BASE: 0.03,
  HARMONIC_RANGE: 0.5, 
  GRACE_PERIOD: 3.0, // Seconds of invulnerability at start
  
  // Visual
  PRESSURE_SCALE: 4.0,
  PARTICLE_COUNT: 150,
  COLOR_HOT: [255, 120, 60],
  COLOR_COLD: [60, 160, 255],
  COLOR_NEUTRAL: [8, 10, 15],
  
  // Input
  MOVE_SPEED: 200,
  
  // Nodes
  NODE_COUNT: 4,
  NODE_ENERGY_BOOST: 0.1
};