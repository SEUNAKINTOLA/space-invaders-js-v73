/**
 * @file ProjectileManager.ts
 * @description Manages projectile creation, lifecycle and collision detection in the game
 * @module ProjectileManager
 */

import { Vector2 } from '../types/Vector2';
import { GameObject } from '../types/GameObject';
import { ObjectPool } from '../utils/ObjectPool';
import { EventEmitter } from '../utils/EventEmitter';

/**
 * Represents projectile configuration options
 */
interface ProjectileConfig {
  speed: number;
  damage: number;
  lifetime: number;
  size: Vector2;
  sprite?: string;
}

/**
 * Represents a single projectile instance
 */
class Projectile implements GameObject {
  public position: Vector2;
  public velocity: Vector2;
  public active: boolean;
  public damage: number;
  private lifetime: number;
  private elapsedTime: number;
  private size: Vector2;

  constructor(config: ProjectileConfig) {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.active = false;
    this.damage = config.damage;
    this.lifetime = config.lifetime;
    this.elapsedTime = 0;
    this.size = config.size;
  }

  /**
   * Initializes the projectile with position and direction
   */
  public init(position: Vector2, direction: Vector2, speed: number): void {
    this.position = { ...position };
    this.velocity = {
      x: direction.x * speed,
      y: direction.y * speed
    };
    this.active = true;
    this.elapsedTime = 0;
  }

  /**
   * Updates the projectile state
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    this.elapsedTime += deltaTime;
    if (this.elapsedTime >= this.lifetime) {
      this.deactivate();
    }
  }

  /**
   * Deactivates the projectile
   */
  public deactivate(): void {
    this.active = false;
  }
}

/**
 * Manages all projectiles in the game
 */
export class ProjectileManager {
  private static readonly DEFAULT_POOL_SIZE = 100;
  private static readonly DEFAULT_PROJECTILE_CONFIG: ProjectileConfig = {
    speed: 500,
    damage: 10,
    lifetime: 2000,
    size: { x: 10, y: 10 }
  };

  private projectilePool: ObjectPool<Projectile>;
  private config: ProjectileConfig;
  private events: EventEmitter;

  constructor(config?: Partial<ProjectileConfig>) {
    this.config = { ...ProjectileManager.DEFAULT_PROJECTILE_CONFIG, ...config };
    this.events = new EventEmitter();
    this.initializePool();
  }

  /**
   * Initializes the projectile pool
   */
  private initializePool(): void {
    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(this.config),
      ProjectileManager.DEFAULT_POOL_SIZE
    );
  }

  /**
   * Spawns a new projectile
   * @throws {Error} If no projectiles are available in the pool
   */
  public spawnProjectile(position: Vector2, direction: Vector2): Projectile {
    try {
      const projectile = this.projectilePool.acquire();
      if (!projectile) {
        throw new Error('No projectiles available in pool');
      }

      projectile.init(position, direction, this.config.speed);
      this.events.emit('projectileSpawned', projectile);
      return projectile;
    } catch (error) {
      console.error('Error spawning projectile:', error);
      throw error;
    }
  }

  /**
   * Updates all active projectiles
   */
  public update(deltaTime: number): void {
    this.projectilePool.getActiveObjects().forEach(projectile => {
      projectile.update(deltaTime);
      
      if (!projectile.active) {
        this.projectilePool.release(projectile);
        this.events.emit('projectileDestroyed', projectile);
      }
    });
  }

  /**
   * Checks for collisions between projectiles and targets
   */
  public checkCollisions(targets: GameObject[]): void {
    const activeProjectiles = this.projectilePool.getActiveObjects();

    for (const projectile of activeProjectiles) {
      for (const target of targets) {
        if (this.detectCollision(projectile, target)) {
          this.events.emit('projectileHit', { projectile, target });
          projectile.deactivate();
          break;
        }
      }
    }
  }

  /**
   * Simple AABB collision detection
   */
  private detectCollision(projectile: Projectile, target: GameObject): boolean {
    return (
      projectile.position.x < target.position.x + target.size.x &&
      projectile.position.x + projectile.size.x > target.position.x &&
      projectile.position.y < target.position.y + target.size.y &&
      projectile.position.y + projectile.size.y > target.position.y
    );
  }

  /**
   * Subscribes to projectile events
   */
  public on(event: string, callback: Function): void {
    this.events.on(event, callback);
  }

  /**
   * Cleans up all projectiles
   */
  public cleanup(): void {
    this.projectilePool.clear();
    this.events.clear();
  }
}