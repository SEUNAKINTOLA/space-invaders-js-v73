/**
 * @file ParticleSystem.ts
 * @description Manages and renders particle effects for visual animations.
 * Provides a flexible and efficient system for creating, updating, and
 * managing particle emitters and individual particles.
 */

// Types and interfaces
interface Vector2D {
  x: number;
  y: number;
}

interface ParticleConfig {
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  life: number;
  alpha: number;
}

interface EmitterConfig {
  position: Vector2D;
  rate: number;
  burst: number;
  maxParticles: number;
  particleConfig: Partial<ParticleConfig>;
}

/**
 * Represents a single particle in the system
 */
class Particle {
  private position: Vector2D;
  private velocity: Vector2D;
  private color: string;
  private size: number;
  private life: number;
  private maxLife: number;
  private alpha: number;

  constructor(config: ParticleConfig) {
    this.position = { ...config.position };
    this.velocity = { ...config.velocity };
    this.color = config.color;
    this.size = config.size;
    this.maxLife = config.life;
    this.life = config.life;
    this.alpha = config.alpha;
  }

  /**
   * Updates particle state based on delta time
   * @param deltaTime Time elapsed since last update in seconds
   * @returns boolean indicating if particle is still alive
   */
  public update(deltaTime: number): boolean {
    this.life -= deltaTime;
    if (this.life <= 0) return false;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.alpha = (this.life / this.maxLife);

    return true;
  }

  /**
   * Renders the particle to the provided context
   * @param ctx Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Manages particle emission and lifecycle
 */
class ParticleEmitter {
  private position: Vector2D;
  private particles: Particle[] = [];
  private rate: number;
  private burst: number;
  private maxParticles: number;
  private particleConfig: Partial<ParticleConfig>;
  private accumulatedTime: number = 0;

  constructor(config: EmitterConfig) {
    this.position = config.position;
    this.rate = config.rate;
    this.burst = config.burst;
    this.maxParticles = config.maxParticles;
    this.particleConfig = config.particleConfig;
  }

  /**
   * Creates a new particle with randomized properties
   */
  private createParticle(): Particle {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 100 + 50;

    const config: ParticleConfig = {
      position: { ...this.position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      color: this.particleConfig.color || '#ffffff',
      size: this.particleConfig.size || Math.random() * 4 + 2,
      life: this.particleConfig.life || Math.random() * 2 + 1,
      alpha: 1
    };

    return new Particle(config);
  }

  /**
   * Updates emitter and particle states
   * @param deltaTime Time elapsed since last update in seconds
   */
  public update(deltaTime: number): void {
    // Update existing particles
    this.particles = this.particles.filter(particle => particle.update(deltaTime));

    // Emit new particles
    this.accumulatedTime += deltaTime;
    const particlesToEmit = Math.floor(this.accumulatedTime * this.rate);
    this.accumulatedTime -= particlesToEmit / this.rate;

    for (let i = 0; i < particlesToEmit; i++) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push(this.createParticle());
      }
    }
  }

  /**
   * Renders all particles
   * @param ctx Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => particle.render(ctx));
  }

  /**
   * Emits a burst of particles
   */
  public emit(): void {
    for (let i = 0; i < this.burst; i++) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push(this.createParticle());
      }
    }
  }
}

/**
 * Main particle system manager
 */
export class ParticleSystem {
  private emitters: Map<string, ParticleEmitter> = new Map();

  /**
   * Creates a new particle emitter
   * @param id Unique identifier for the emitter
   * @param config Emitter configuration
   * @throws Error if emitter with ID already exists
   */
  public createEmitter(id: string, config: EmitterConfig): void {
    if (this.emitters.has(id)) {
      throw new Error(`Emitter with ID '${id}' already exists`);
    }
    this.emitters.set(id, new ParticleEmitter(config));
  }

  /**
   * Removes an emitter from the system
   * @param id Emitter identifier
   * @returns boolean indicating if emitter was removed
   */
  public removeEmitter(id: string): boolean {
    return this.emitters.delete(id);
  }

  /**
   * Triggers a burst of particles from specified emitter
   * @param id Emitter identifier
   * @throws Error if emitter doesn't exist
   */
  public emit(id: string): void {
    const emitter = this.emitters.get(id);
    if (!emitter) {
      throw new Error(`Emitter with ID '${id}' not found`);
    }
    emitter.emit();
  }

  /**
   * Updates all particle emitters
   * @param deltaTime Time elapsed since last update in seconds
   */
  public update(deltaTime: number): void {
    this.emitters.forEach(emitter => emitter.update(deltaTime));
  }

  /**
   * Renders all particle effects
   * @param ctx Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    this.emitters.forEach(emitter => emitter.render(ctx));
  }
}