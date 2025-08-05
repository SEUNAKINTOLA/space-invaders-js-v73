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
import { SoundManager } from '../audio/SoundManager';

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
  },
  SOUND_EFFECTS: {
    SHOOT: 'player-shoot',
    MOVE: 'player-move',
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
  private soundManager: SoundManager;

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
      this.soundManager = SoundManager.getInstance();
      this.initializeSoundEffects();
    } catch (error) {
      throw new Error(`Failed to initialize player: ${error.message}`);
    }

    // Set up keyboard event listeners
    this.initializeKeyboardControls();
  }

  /**
   * Initializes sound effects for the player
   * @private
   */
  private initializeSoundEffects(): void {
    try {
      this.soundManager.loadSound(
        PLAYER_CONFIG.SOUND_EFFECTS.SHOOT,
        GameConfig.ASSETS_PATH + '/sounds/shoot.mp3'
      );
      this.soundManager.loadSound(
        PLAYER_CONFIG.SOUND_EFFECTS.MOVE,
        GameConfig.ASSETS_PATH + '/sounds/move.mp3'
      );
    } catch (error) {
      console.warn('Failed to load player sound effects:', error);
    }
  }

  /**
   * Triggers the shooting action and plays associated sound effect
   * @returns {boolean} Whether the shot was successfully fired
   */
  public shoot(): boolean {
    if (!this.isActive) return false;

    try {
      // Play shoot sound effect
      this.soundManager.playSound(PLAYER_CONFIG.SOUND_EFFECTS.SHOOT);
      
      // Additional shooting logic would go here
      return true;
    } catch (error) {
      console.warn('Failed to play shoot sound effect:', error);
      return false;
    }
  }

  // ... [Previous methods remain unchanged]

  /**
   * Updates velocity based on current movement state
   * @private
   */
  private updateVelocityFromInput(): void {
    let horizontalMovement = 0;
    
    if (this.movementState.left) horizontalMovement -= 1;
    if (this.movementState.right) horizontalMovement += 1;

    if (horizontalMovement !== 0) {
      try {
        this.soundManager.playSound(PLAYER_CONFIG.SOUND_EFFECTS.MOVE);
      } catch (error) {
        console.warn('Failed to play movement sound effect:', error);
      }
    }

    this.velocity.x = horizontalMovement * PLAYER_CONFIG.DEFAULT_SPEED;
  }

  /**
   * Cleanup method to remove event listeners and dispose of sound resources
   * Should be called when the player instance is destroyed
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyboardInput);
    window.removeEventListener('keyup', this.handleKeyboardInput);
    
    // Cleanup sound effects
    try {
      this.soundManager.unloadSound(PLAYER_CONFIG.SOUND_EFFECTS.SHOOT);
      this.soundManager.unloadSound(PLAYER_CONFIG.SOUND_EFFECTS.MOVE);
    } catch (error) {
      console.warn('Failed to unload player sound effects:', error);
    }
  }

  // ... [Rest of the existing code remains unchanged]
}