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

    try {
      this.sprite = new Sprite({
        width: PLAYER_CONFIG.SPRITE_WIDTH,
        height: PLAYER_CONFIG.SPRITE_HEIGHT,
        imagePath: GameConfig.ASSETS_PATH + '/player-ship.png'
      });
    } catch (error) {
      throw new Error(`Failed to initialize player sprite: ${error.message}`);
    }
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

  /**
   * Renders the player ship
   * @param context - The rendering context
   */
  public render(context: CanvasRenderingContext2D): void {
    if (!this.isActive || !this.sprite) return;

    context.save();
    
    // Transform context for rotation
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    
    // Draw the sprite
    this.sprite.draw(
      context,
      -PLAYER_CONFIG.SPRITE_WIDTH / 2,
      -PLAYER_CONFIG.SPRITE_HEIGHT / 2
    );

    context.restore();
  }

  /**
   * Sets the player's movement direction
   * @param direction - Movement vector
   */
  public setMovement(direction: Vector2D): void {
    this.velocity = {
      x: direction.x * PLAYER_CONFIG.DEFAULT_SPEED,
      y: direction.y * PLAYER_CONFIG.DEFAULT_SPEED
    };
  }

  /**
   * Rotates the player ship
   * @param angle - Rotation angle in radians
   */
  public rotate(angle: number): void {
    this.rotation += angle * PLAYER_CONFIG.ROTATION_SPEED;
  }

  /**
   * Applies damage to the player
   * @param amount - Amount of damage to apply
   * @returns boolean - Whether the player is still alive
   */
  public takeDamage(amount: number): boolean {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isActive = false;
    }
    return this.isActive;
  }

  /**
   * Gets the current position of the player
   * @returns Vector2D - Current position
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Gets the current health of the player
   * @returns number - Current health
   */
  public getHealth(): number {
    return this.health;
  }

  /**
   * Keeps the player within the game bounds
   * @private
   */
  private constrainToBounds(): void {
    const bounds = GameConfig.GAME_BOUNDS;
    this.position.x = Math.max(0, Math.min(this.position.x, bounds.width));
    this.position.y = Math.max(0, Math.min(this.position.y, bounds.height));
  }

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
  }
}