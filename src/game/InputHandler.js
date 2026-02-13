import nipplejs from 'nipplejs';
import { Vector2D } from '../utils/Vector2D.js';

export class InputHandler {
  constructor() {
    this.movement = new Vector2D(0, 0);
    this.isMobile = 'ontouchstart' in window;
    
    if (this.isMobile) {
      this.setupMobileControls();
    } else {
      this.setupDesktopControls();
    }
  }
  
  setupMobileControls() {
    const joystick = nipplejs.create({
      zone: document.body,
      mode: 'static',
      position: { left: '80px', bottom: '80px' },
      color: 'rgba(255, 255, 255, 0.5)',
      size: 120
    });
    
    joystick.on('move', (evt, data) => {
      if (data.direction) {
        const angle = data.angle.radian;
        const force = Math.min(data.force, 2);
        this.movement.x = Math.cos(angle) * force;
        this.movement.y = -Math.sin(angle) * force;
      }
    });
    
    joystick.on('end', () => {
      this.movement.x = 0;
      this.movement.y = 0;
    });
  }
  
  setupDesktopControls() {
    this.keys = {};
    
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  getMovement() {
    if (this.isMobile) {
      return this.movement.clone();
    }
    
    const move = new Vector2D(0, 0);
    if (this.keys['w']) move.y -= 1;
    if (this.keys['s']) move.y += 1;
    if (this.keys['a']) move.x -= 1;
    if (this.keys['d']) move.x += 1;
    
    return move.length() > 0 ? move.normalize() : move;
  }
}