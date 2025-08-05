/**
 * @file Player.ts
 * @description Player ship entity implementation including rendering and basic functionality
 * @module entities/Player
 */

import { Vector2D } from '../types/Vector2D';
import { Sprite } from '../graphics/Sprite';
import { Renderable } from '../interfaces/Renderable';
import { Entity } from '../interfaces/Entity';
import { GameConfig } from '../config/GameConfig';

/**
 * Configuration constants for the player ship
 */
const PLAYER_CONFIG = {
  DEFAULT_SPEED: 5,
  ROTATION_SPEED: 0.1,
  SPRITE_WIDTH: 32,
  SPRITE_HEIGHT: 32,
  INITIAL_HEALTH: 100,
  MOVEMENT_KEYS: {
    LEFT: ['ArrowLeft', 'a', 'A'],
    RIGHT: ['ArrowRight', 'd', 'D'],
  }
} as const;

/**
 * Represents the player's ship in the game
 * @implements {Entity}
 * @implements {Renderable}
 */
export class Player implements Entity, Renderable {
  private position: Vector2D;
  private velocity: Vector2D;
  private rotation: number;
  private sprite: Sprite;
  private health: number;
  private isActive: boolean;
  private movementState: {
    left: boolean;
    right: boolean;
  };

  /**
   * Creates a new Player instance
   * @param initialPosition - Starting position of the player ship
   * @throws {Error} If sprite loading fails
   */
  constructor(initialPosition: Vector2D) {
    this.position = { ...initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.health = PLAYER_CONFIG.INITIAL_HEALTH;
    this.isActive = true;
    this.movementState = {
      left: false,
      right: false
    };

    try {
      this.sprite = new Sprite({
        width: PLAYER_CONFIG.SPRITE_WIDTH,
        height: PLAYER_CONFIG.SPRITE_HEIGHT,
        imagePath: GameConfig.ASSETS_PATH + '/player-ship.png'
      });
    } catch (error) {
      throw new Error(`Failed to initialize player sprite: ${error.message}`);
    }

    // Set up keyboard event listeners
    this.initializeKeyboardControls();
  }

  /**
   * Sets up keyboard event listeners for player movement
   * @private
   */
  private initializeKeyboardControls(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyboardInput(event.key, true);
    });

    window.addEventListener('keyup', (event: KeyboardEvent) => {
      this.handleKeyboardInput(event.key, false);
    });
  }

  /**
   * Handles keyboard input for player movement
   * @param key - The key that was pressed/released
   * @param isPressed - Whether the key was pressed (true) or released (false)
   * @private
   */
  private handleKeyboardInput(key: string, isPressed: boolean): void {
    if (!this.isActive) return;

    if (PLAYER_CONFIG.MOVEMENT_KEYS.LEFT.includes(key)) {
      this.movementState.left = isPressed;
      this.updateVelocityFromInput();
    } else if (PLAYER_CONFIG.MOVEMENT_KEYS.RIGHT.includes(key)) {
      this.movementState.right = isPressed;
      this.updateVelocityFromInput();
    }
  }

  /**
   * Updates velocity based on current movement state
   * @private
   */
  private updateVelocityFromInput(): void {
    let horizontalMovement = 0;
    
    if (this.movementState.left) horizontalMovement -= 1;
    if (this.movementState.right) horizontalMovement += 1;

    this.velocity.x = horizontalMovement * PLAYER_CONFIG.DEFAULT_SPEED;
  }

  /**
   * Updates the player's state
   * @param deltaTime - Time elapsed since last update
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Keep player within game bounds
    this.constrainToBounds();
  }

  // ... [rest of the existing code remains unchanged]

  /**
   * Resets the player to initial state
   * @param position - Reset position
   */
  public reset(position: Vector2D): void {
    this.position = { ...position };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.health = PLAYER_CONFIG.INITIAL_HEALTH;
    this.isActive = true;
    this.movementState = {
      left: false,
      right: false
    };
  }

  /**
   * Cleanup method to remove event listeners
   * Should be called when the player instance is destroyed
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyboardInput);
    window.removeEventListener('keyup', this.handleKeyboardInput);
  }
}