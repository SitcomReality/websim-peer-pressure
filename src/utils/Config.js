export const Config = {
  // Simulation
  GRID_SIZE: 128,
  TIME_STEP: 0.016,
  WAVE_SPEED: 160,
  DAMPING: 0.992, // Slightly more damping for stability
  
  // Entities
  PLAYER_AMPLITUDE: 0.8,
  ENTITY_PULSE_FREQ: 2.0,
  RESONANCE_THRESHOLD: 1.2,
  ENERGY_DRAIN_BASE: 0.08,
  HARMONIC_RANGE: 0.4, // Tolerance for "friendly" frequencies
  
  // Visual
  PRESSURE_SCALE: 2.5,
  PARTICLE_COUNT: 200,
  COLOR_HOT: [255, 100, 50],
  COLOR_COLD: [50, 150, 255],
  COLOR_NEUTRAL: [10, 12, 18],
  
  // Input
  MOVE_SPEED: 220,
  
  // Nodes
  NODE_COUNT: 4,
  NODE_ENERGY_BOOST: 0.1
};