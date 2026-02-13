export const Config = {
  // Simulation
  GRID_SIZE: 128,
  TIME_STEP: 0.008,
  WAVE_SPEED: 20,      // Much slower, gentler waves
  DAMPING: 0.985,      // More damping for smoother field
  
  // Entities
  PLAYER_AMPLITUDE: 0.4,
  ENTITY_PULSE_FREQ: 0.6,      // Slower gentle pulses
  RESONANCE_THRESHOLD: 4.0,    // Rare, special events
  MAX_ENTITIES: 25,
  ENERGY_DRAIN_BASE: 0.005,    // Minimal drain
  HARMONIC_RANGE: 0.8,         // Easier to harmonize
  GRACE_PERIOD: 10.0,          // Long grace period
  ENERGY_WARNING: 0.3,         // Warning threshold
  
  // Visual
  PRESSURE_SCALE: 2.5,
  PARTICLE_COUNT: 120,
  COLOR_HOT: [255, 200, 150],      // Warm peach
  COLOR_COLD: [180, 220, 255],     // Soft sky blue
  COLOR_NEUTRAL: [15, 18, 25],     // Deep navy
  COLOR_PLAYER: [255, 240, 220],   // Warm white
  COLOR_WARNING: [255, 160, 100],  // Gentle amber warning
  
  // Input
  THRUST_FORCE: 800,   // Force applied when moving forward/backward
  ROTATION_SPEED: 4.5, // Radians per second
  FRICTION: 0.96,      // Velocity retention per frame
  DASH_SPEED: 1200,    // Burst of speed
  DASH_DURATION: 0.2,
  DASH_COOLDOWN: 1.5,
  
  // Physics
  PRESSURE_FORCE_MULTIPLIER: 140, // High multiplier for responsive field-based movement
  EXHAUST_STRENGTH: 1500,        // Strength of the pressure exhaust
  
  // Nodes
  NODE_COUNT: 5,
  NODE_ENERGY_BOOST: 0.15,
  
  // Entity Types
  ENTITY_TYPES: {
    PULSER: 0,
    EMITTER: 1,
    ATTRACTOR: 2,
    REPULSOR: 3,
    PIRATE: 4,
    COMPRESSOR: 5
  }
};