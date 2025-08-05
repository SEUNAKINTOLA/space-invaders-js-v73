/**
 * @file Projectile.ts
 * @description Implements the projectile entity for the game's shooting mechanics.
 * Handles projectile behavior, lifecycle, and collision detection.
 */

// Types and interfaces
interface ProjectileConfig {
  speed: number;
  damage: number;
  range: number;
  direction: Vector2D;
}

interface Vector2D {
  x: number;
  y: number;
}

/**
 * Represents a projectile entity in the game world.
 * Handles movement, collision detection, and damage dealing.
 */
export class Projectile {
  private position: Vector2D;
  private readonly speed: number;
  private readonly damage: number;
  private readonly range: number;
  private direction: Vector2D;
  private distanceTraveled: number;
  private active: boolean;

  /**
   * Creates a new Projectile instance.
   * @param startPosition - Initial spawn position of the projectile
   * @param config - Configuration object for projectile properties
   * @throws {Error} If invalid parameters are provided
   */
  constructor(startPosition: Vector2D, config: ProjectileConfig) {
    this.validateConstructorParams(startPosition, config);

    this.position = { ...startPosition };
    this.speed = config.speed;
    this.damage = config.damage;
    this.range = config.range;
    this.direction = this.normalizeDirection(config.direction);
    this.distanceTraveled = 0;
    this.active = true;
  }

  /**
   * Updates the projectile's position and state.
   * @param deltaTime - Time elapsed since last update in seconds
   * @returns boolean - Whether the projectile is still active
   */
  public update(deltaTime: number): boolean {
    if (!this.active) return false;

    const movement = this.calculateMovement(deltaTime);
    this.position.x += movement.x;
    this.position.y += movement.y;

    this.distanceTraveled += Math.sqrt(
      movement.x * movement.x + movement.y * movement.y
    );

    if (this.distanceTraveled >= this.range) {
      this.deactivate();
    }

    return this.active;
  }

  /**
   * Gets the current position of the projectile.
   * @returns Vector2D - Current position
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Gets the damage value of the projectile.
   * @returns number - Damage value
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * Checks if the projectile is still active.
   * @returns boolean - Active status
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Handles collision with other game entities.
   * @param target - The entity the projectile collided with
   */
  public onCollision(target: any): void {
    this.deactivate();
  }

  /**
   * Deactivates the projectile.
   */
  private deactivate(): void {
    this.active = false;
  }

  /**
   * Calculates the movement vector for the current frame.
   * @param deltaTime - Time elapsed since last update
   * @returns Vector2D - Movement vector
   */
  private calculateMovement(deltaTime: number): Vector2D {
    return {
      x: this.direction.x * this.speed * deltaTime,
      y: this.direction.y * this.speed * deltaTime
    };
  }

  /**
   * Normalizes the direction vector to ensure consistent speed.
   * @param direction - Raw direction vector
   * @returns Vector2D - Normalized direction vector
   */
  private normalizeDirection(direction: Vector2D): Vector2D {
    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    return {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
  }

  /**
   * Validates constructor parameters.
   * @param startPosition - Initial position
   * @param config - Projectile configuration
   * @throws {Error} If parameters are invalid
   */
  private validateConstructorParams(
    startPosition: Vector2D,
    config: ProjectileConfig
  ): void {
    if (!startPosition || typeof startPosition.x !== 'number' || typeof startPosition.y !== 'number') {
      throw new Error('Invalid start position provided');
    }

    if (!config || typeof config.speed !== 'number' || config.speed <= 0) {
      throw new Error('Invalid speed value provided');
    }

    if (typeof config.damage !== 'number' || config.damage < 0) {
      throw new Error('Invalid damage value provided');
    }

    if (typeof config.range !== 'number' || config.range <= 0) {
      throw new Error('Invalid range value provided');
    }

    if (!config.direction || typeof config.direction.x !== 'number' || typeof config.direction.y !== 'number') {
      throw new Error('Invalid direction vector provided');
    }
  }
}