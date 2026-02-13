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
  MOVE_SPEED: 140,     // Slower, more deliberate movement
  DASH_SPEED: 400,
  DASH_DURATION: 0.25,
  DASH_COOLDOWN: 2.0,
  
  // Physics
  PRESSURE_FORCE_MULTIPLIER: 25,  // How much pressure affects player movement
  
  // Nodes
  NODE_COUNT: 5,
  NODE_ENERGY_BOOST: 0.15,
  
  // Entity Types
  ENTITY_TYPES: {
    PULSER: 0,      // Normal pulsing entity
    EMITTER: 1,     // Constant pressure emitter
    ATTRACTOR: 2,   // Pulls things in
    REPULSOR: 3     // Pushes things away
  }
};