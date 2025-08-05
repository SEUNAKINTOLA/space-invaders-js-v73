/**
 * @file Enemy.ts
 * @description Implements base enemy class with configurable movement patterns
 * @module entities/Enemy
 */

// =========================================================
// Types and Interfaces
// =========================================================

/**
 * Represents a 2D position vector
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Supported movement pattern types
 */
export enum MovementPattern {
  LINEAR = 'linear',
  CIRCULAR = 'circular',
  SINE_WAVE = 'sine_wave',
  FOLLOW = 'follow',
  STATIONARY = 'stationary'
}

/**
 * Configuration options for enemy initialization
 */
interface EnemyConfig {
  position: Vector2D;
  speed: number;
  movementPattern: MovementPattern;
  patrolRadius?: number;
  amplitude?: number;
  frequency?: number;
}

// =========================================================
// Constants
// =========================================================

const DEFAULT_SPEED = 2;
const DEFAULT_PATROL_RADIUS = 100;
const DEFAULT_AMPLITUDE = 50;
const DEFAULT_FREQUENCY = 0.02;

// =========================================================
// Enemy Class Implementation
// =========================================================

export class Enemy {
  private position: Vector2D;
  private velocity: Vector2D;
  private initialPosition: Vector2D;
  private movementPattern: MovementPattern;
  private speed: number;
  private angle: number = 0;
  private patrolRadius: number;
  private amplitude: number;
  private frequency: number;

  /**
   * Creates a new Enemy instance
   * @param config - Enemy configuration options
   * @throws {Error} If invalid configuration is provided
   */
  constructor(config: EnemyConfig) {
    this.validateConfig(config);

    this.position = { ...config.position };
    this.initialPosition = { ...config.position };
    this.speed = config.speed || DEFAULT_SPEED;
    this.movementPattern = config.movementPattern;
    this.patrolRadius = config.patrolRadius || DEFAULT_PATROL_RADIUS;
    this.amplitude = config.amplitude || DEFAULT_AMPLITUDE;
    this.frequency = config.frequency || DEFAULT_FREQUENCY;
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * Updates enemy position based on current movement pattern
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    switch (this.movementPattern) {
      case MovementPattern.LINEAR:
        this.updateLinearMovement(deltaTime);
        break;
      case MovementPattern.CIRCULAR:
        this.updateCircularMovement(deltaTime);
        break;
      case MovementPattern.SINE_WAVE:
        this.updateSineWaveMovement(deltaTime);
        break;
      case MovementPattern.FOLLOW:
        // Implementation for following behavior would go here
        break;
      case MovementPattern.STATIONARY:
        // No movement needed
        break;
      default:
        throw new Error(`Unsupported movement pattern: ${this.movementPattern}`);
    }
  }

  /**
   * Gets the current position of the enemy
   * @returns Current position vector
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Sets the enemy's position
   * @param position - New position vector
   */
  public setPosition(position: Vector2D): void {
    this.position = { ...position };
  }

  // =========================================================
  // Private Methods
  // =========================================================

  /**
   * Validates enemy configuration
   * @param config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  private validateConfig(config: EnemyConfig): void {
    if (!config.position || typeof config.position.x !== 'number' || typeof config.position.y !== 'number') {
      throw new Error('Invalid position configuration');
    }

    if (config.speed && config.speed <= 0) {
      throw new Error('Speed must be greater than 0');
    }

    if (!Object.values(MovementPattern).includes(config.movementPattern)) {
      throw new Error('Invalid movement pattern');
    }
  }

  /**
   * Updates position for linear movement pattern
   */
  private updateLinearMovement(deltaTime: number): void {
    // Simple back-and-forth movement
    this.position.x += this.speed * deltaTime;
    if (Math.abs(this.position.x - this.initialPosition.x) > this.patrolRadius) {
      this.speed *= -1;
    }
  }

  /**
   * Updates position for circular movement pattern
   */
  private updateCircularMovement(deltaTime: number): void {
    this.angle += this.speed * deltaTime * 0.001;
    this.position.x = this.initialPosition.x + Math.cos(this.angle) * this.patrolRadius;
    this.position.y = this.initialPosition.y + Math.sin(this.angle) * this.patrolRadius;
  }

  /**
   * Updates position for sine wave movement pattern
   */
  private updateSineWaveMovement(deltaTime: number): void {
    this.position.x += this.speed * deltaTime;
    this.position.y = this.initialPosition.y + 
      Math.sin(this.position.x * this.frequency) * this.amplitude;
  }
}