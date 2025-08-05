/**
 * @file Enemy.ts
 * @description Implements base enemy class with configurable movement patterns
 * @module entities/Enemy
 */

import { AudioManager } from '../managers/AudioManager';

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
const ENEMY_DEATH_SOUND = 'enemy-destruction';

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
  private audioManager: AudioManager;
  private isDestroyed: boolean = false;

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
    this.audioManager = AudioManager.getInstance();
  }

  /**
   * Handles enemy death and plays destruction sound effect
   * @throws {Error} If death method is called on already destroyed enemy
   * @returns {boolean} True if death was handled successfully
   */
  public death(): boolean {
    if (this.isDestroyed) {
      throw new Error('Cannot destroy an already destroyed enemy');
    }

    try {
      this.audioManager.playSound(ENEMY_DEATH_SOUND);
      this.isDestroyed = true;
      return true;
    } catch (error) {
      console.error('Failed to play enemy death sound:', error);
      this.isDestroyed = true;
      return false;
    }
  }

  /**
   * Checks if the enemy is destroyed
   * @returns {boolean} True if the enemy is destroyed
   */
  public isDestroyedState(): boolean {
    return this.isDestroyed;
  }

  // ... [All existing methods remain unchanged]

  /**
   * Updates enemy position based on current movement pattern
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    if (this.isDestroyed) {
      return;
    }

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

  // ... [Rest of the existing code remains unchanged]
}