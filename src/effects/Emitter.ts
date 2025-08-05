/**
 * @file Emitter.ts
 * @description Particle emitter system for managing visual particle effects
 * Handles particle creation, lifecycle management, and rendering
 */

// Types and interfaces
interface ParticleConfig {
    x: number;
    y: number;
    speed: number;
    lifetime: number;
    color: string;
    size: number;
    direction: number;
}

interface EmitterConfig {
    maxParticles: number;
    emissionRate: number;
    position: Vector2D;
    spread: number;
}

interface Vector2D {
    x: number;
    y: number;
}

/**
 * Represents a single particle in the system
 */
class Particle {
    private position: Vector2D;
    private velocity: Vector2D;
    private life: number;
    private maxLife: number;
    private color: string;
    private size: number;

    constructor(config: ParticleConfig) {
        this.position = { x: config.x, y: config.y };
        this.velocity = {
            x: Math.cos(config.direction) * config.speed,
            y: Math.sin(config.direction) * config.speed
        };
        this.life = config.lifetime;
        this.maxLife = config.lifetime;
        this.color = config.color;
        this.size = config.size;
    }

    /**
     * Updates particle state based on delta time
     * @param deltaTime Time elapsed since last update in milliseconds
     * @returns boolean indicating if particle is still alive
     */
    public update(deltaTime: number): boolean {
        this.life -= deltaTime;
        if (this.life <= 0) return false;

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        return true;
    }

    /**
     * Gets the current opacity based on remaining lifetime
     */
    public getOpacity(): number {
        return Math.max(0, Math.min(1, this.life / this.maxLife));
    }

    /**
     * Renders the particle to the provided context
     */
    public render(ctx: CanvasRenderingContext2D): void {
        const opacity = this.getOpacity();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

/**
 * Particle Emitter class responsible for managing particle lifecycle
 */
export class ParticleEmitter {
    private particles: Particle[] = [];
    private config: EmitterConfig;
    private lastEmission: number = 0;
    private active: boolean = false;

    /**
     * Creates a new particle emitter
     * @param config Emitter configuration options
     * @throws Error if configuration is invalid
     */
    constructor(config: EmitterConfig) {
        this.validateConfig(config);
        this.config = config;
    }

    /**
     * Validates emitter configuration
     * @param config Configuration to validate
     * @throws Error if configuration is invalid
     */
    private validateConfig(config: EmitterConfig): void {
        if (config.maxParticles <= 0) {
            throw new Error('maxParticles must be greater than 0');
        }
        if (config.emissionRate <= 0) {
            throw new Error('emissionRate must be greater than 0');
        }
    }

    /**
     * Starts particle emission
     */
    public start(): void {
        this.active = true;
    }

    /**
     * Stops particle emission
     */
    public stop(): void {
        this.active = false;
    }

    /**
     * Creates a new particle with randomized properties within configured ranges
     */
    private createParticle(): Particle {
        const spread = this.config.spread;
        const direction = (Math.random() - 0.5) * spread;
        
        return new Particle({
            x: this.config.position.x,
            y: this.config.position.y,
            speed: 1 + Math.random() * 2,
            lifetime: 1000 + Math.random() * 2000,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            size: 2 + Math.random() * 4,
            direction: direction
        });
    }

    /**
     * Updates the particle system
     * @param deltaTime Time elapsed since last update in milliseconds
     */
    public update(deltaTime: number): void {
        // Update existing particles
        this.particles = this.particles.filter(particle => 
            particle.update(deltaTime)
        );

        // Emit new particles if active
        if (this.active) {
            const currentTime = Date.now();
            const emissionDelay = 1000 / this.config.emissionRate;

            if (currentTime - this.lastEmission >= emissionDelay) {
                if (this.particles.length < this.config.maxParticles) {
                    this.particles.push(this.createParticle());
                    this.lastEmission = currentTime;
                }
            }
        }
    }

    /**
     * Renders all particles
     * @param ctx Canvas rendering context
     */
    public render(ctx: CanvasRenderingContext2D): void {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }

    /**
     * Gets the current particle count
     */
    public getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * Updates emitter position
     * @param position New position vector
     */
    public setPosition(position: Vector2D): void {
        this.config.position = { ...position };
    }
}