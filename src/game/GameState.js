import { PressureField } from '../simulation/PressureField.js';
import { EntityManager } from './EntityManager.js';
import { InputHandler } from './InputHandler.js';
import { Config } from '../utils/Config.js';

export class GameState {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.field = new PressureField(width, height);
    this.entityManager = new EntityManager();
    this.input = new InputHandler();
    
    // Dash state
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dashDirection = { x: 0, y: 0 };
    
    // Barriers
    this.barriers = this.createBarriers();
    
    // Create player in center
    this.entityManager.createPlayer(width / 2, height / 2);
    
    // Spawn static environmental nodes
    for (let i = 0; i < Config.NODE_COUNT; i++) {
      const x = (i + 0.5) * (width / Config.NODE_COUNT);
      const y = height * (0.2 + Math.random() * 0.6);
      this.entityManager.spawnNode(x, y, 1.0 + Math.random() * 2.0);
    }

    // Spawn varied initial entities
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.entityManager.spawnEntity(x, y);
    }
  }
  
  createBarriers() {
    const barriers = [];
    const count = 3;
    for (let i = 0; i < count; i++) {
      barriers.push({
        x: this.width * (0.2 + i * 0.3),
        y: this.height * 0.5,
        radius: 60,
        frequency: 1.5 + i * 0.5
      });
    }
    return barriers;
  }
  
  update(dt) {
    // Update dash
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }
    
    // Handle player movement
    const movement = this.input.getMovement();
    const player = this.entityManager.player;

    if (player && player.alive) {
      // Rotation (A/D or horizontal stick)
      player.rotation += movement.x * Config.ROTATION_SPEED * dt;

      // Check for dash input
      if (this.input.consumeDash() && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.dashTimer = Config.DASH_DURATION;
        this.dashCooldown = Config.DASH_COOLDOWN;
        this.dashDirection = new Vector2D(Math.cos(player.rotation), Math.sin(player.rotation));
      }
      
      if (this.isDashing) {
        player.velocity.x = this.dashDirection.x * Config.DASH_SPEED;
        player.velocity.y = this.dashDirection.y * Config.DASH_SPEED;
      } else {
        // Thrust (W/S or vertical stick)
        // Note: movement.y is -1 for W, +1 for S
        const thrustAmount = -movement.y * Config.THRUST_FORCE * dt;
        player.velocity.x += Math.cos(player.rotation) * thrustAmount;
        player.velocity.y += Math.sin(player.rotation) * thrustAmount;

        // Apply pressure forces (more impactful now)
        const fieldVel = this.field.getVelocity(player.position.x, player.position.y);
        player.velocity.x -= fieldVel.x * Config.PRESSURE_FORCE_MULTIPLIER;
        player.velocity.y -= fieldVel.y * Config.PRESSURE_FORCE_MULTIPLIER;

        // Apply friction/drag
        player.velocity.x *= Config.FRICTION;
        player.velocity.y *= Config.FRICTION;
      }
      
      // Update position
      player.position.x += player.velocity.x * dt;
      player.position.y += player.velocity.y * dt;
      
      // Keep player in bounds with soft bounce
      if (player.position.x < 20 || player.position.x > this.width - 20) {
        player.velocity.x *= -0.5;
        player.position.x = Math.max(20, Math.min(this.width - 20, player.position.x));
      }
      if (player.position.y < 20 || player.position.y > this.height - 20) {
        player.velocity.y *= -0.5;
        player.position.y = Math.max(20, Math.min(this.height - 20, player.position.y));
      }
      
      // Auto-absorb nearby entities
      this.entityManager.tryAbsorb(this.entityManager.player);
      
      // Spawn offspring on action press
      if (this.input.consumeAction()) {
        // Cycle through entity types when spawning
        const types = [
          Config.ENTITY_TYPES.PULSER,
          Config.ENTITY_TYPES.EMITTER,
          Config.ENTITY_TYPES.ATTRACTOR,
          Config.ENTITY_TYPES.REPULSOR
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const spawned = this.entityManager.spawnOffspring(
          this.entityManager.player.position.x,
          this.entityManager.player.position.y,
          this.entityManager.player.energy,
          type
        );
        if (spawned) {
          this.entityManager.player.energy -= 0.25;
        }
      }
    }
    
    // Update barriers
    for (const barrier of this.barriers) {
      const phase = performance.now() * 0.001 * barrier.frequency;
      const pressure = Math.sin(phase) * 1.2;
      this.field.addPressure(barrier.x, barrier.y, pressure * dt * 30);
    }
    
    // Update entities
    this.entityManager.update(dt, this.field);
    
    // Update pressure field
    this.field.update(dt);
  }
  
  getStats() {
    return {
      entities: this.entityManager.entities.length,
      playerAlive: this.entityManager.player?.alive || false,
      playerEnergy: this.entityManager.player?.energy.toFixed(2) || 0,
      dashCooldown: Math.max(0, this.dashCooldown),
      isDashing: this.isDashing
    };
  }
}