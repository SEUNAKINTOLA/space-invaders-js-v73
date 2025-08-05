/**
 * @file MovementSystem.ts
 * @description Implements configurable movement patterns for enemy entities
 * @module MovementSystem
 */

// Types and interfaces
interface Position {
  x: number;
  y: number;
}

interface MovementConfig {
  speed: number;
  amplitude?: number;
  frequency?: number;
  radius?: number;
}

/**
 * Enum defining available movement pattern types
 */
export enum MovementPattern {
  LINEAR = 'linear',
  SINE_WAVE = 'sine_wave',
  CIRCULAR = 'circular',
  FOLLOW = 'follow',
}

/**
 * Base class for handling enemy movement calculations and patterns
 */
export class MovementSystem {
  private position: Position;
  private startPosition: Position;
  private config: MovementConfig;
  private time: number;

  /**
   * Creates a new MovementSystem instance
   * @param startX - Initial X position
   * @param startY - Initial Y position
   * @param config - Movement configuration parameters
   */
  constructor(startX: number, startY: number, config: MovementConfig) {
    this.validateConfig(config);
    
    this.position = { x: startX, y: startY };
    this.startPosition = { x: startX, y: startY };
    this.config = {
      speed: config.speed,
      amplitude: config.amplitude || 100,
      frequency: config.frequency || 0.01,
      radius: config.radius || 50
    };
    this.time = 0;
  }

  /**
   * Validates movement configuration parameters
   * @param config - Movement configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: MovementConfig): void {
    if (!config.speed || config.speed <= 0) {
      throw new Error('Movement speed must be greater than 0');
    }
    
    if (config.amplitude && config.amplitude < 0) {
      throw new Error('Amplitude cannot be negative');
    }

    if (config.frequency && config.frequency < 0) {
      throw new Error('Frequency cannot be negative');
    }

    if (config.radius && config.radius < 0) {
      throw new Error('Radius cannot be negative');
    }
  }

  /**
   * Updates entity position based on specified movement pattern
   * @param pattern - Movement pattern to use
   * @param deltaTime - Time elapsed since last update
   * @param targetPosition - Optional target position for following pattern
   * @returns Updated position
   */
  public update(
    pattern: MovementPattern,
    deltaTime: number,
    targetPosition?: Position
  ): Position {
    this.time += deltaTime;

    switch (pattern) {
      case MovementPattern.LINEAR:
        return this.calculateLinearMovement();
      case MovementPattern.SINE_WAVE:
        return this.calculateSineWaveMovement();
      case MovementPattern.CIRCULAR:
        return this.calculateCircularMovement();
      case MovementPattern.FOLLOW:
        return this.calculateFollowMovement(targetPosition);
      default:
        throw new Error(`Unsupported movement pattern: ${pattern}`);
    }
  }

  /**
   * Calculates linear movement pattern
   */
  private calculateLinearMovement(): Position {
    this.position.x = this.startPosition.x + (this.time * this.config.speed);
    return { ...this.position };
  }

  /**
   * Calculates sine wave movement pattern
   */
  private calculateSineWaveMovement(): Position {
    this.position.x = this.startPosition.x + (this.time * this.config.speed);
    this.position.y = this.startPosition.y + 
      Math.sin(this.time * this.config.frequency!) * this.config.amplitude!;
    return { ...this.position };
  }

  /**
   * Calculates circular movement pattern
   */
  private calculateCircularMovement(): Position {
    const angle = this.time * this.config.speed;
    this.position.x = this.startPosition.x + 
      Math.cos(angle) * this.config.radius!;
    this.position.y = this.startPosition.y + 
      Math.sin(angle) * this.config.radius!;
    return { ...this.position };
  }

  /**
   * Calculates movement pattern for following a target
   * @param targetPosition - Position to follow
   * @throws Error if target position is not provided
   */
  private calculateFollowMovement(targetPosition?: Position): Position {
    if (!targetPosition) {
      throw new Error('Target position required for follow movement pattern');
    }

    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = this.config.speed;
      this.position.x += (dx / distance) * speed;
      this.position.y += (dy / distance) * speed;
    }

    return { ...this.position };
  }

  /**
   * Resets the movement system to initial state
   */
  public reset(): void {
    this.position = { ...this.startPosition };
    this.time = 0;
  }

  /**
   * Gets current position
   */
  public getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Updates movement configuration
   * @param newConfig - New movement configuration parameters
   */
  public updateConfig(newConfig: Partial<MovementConfig>): void {
    const updatedConfig = { ...this.config, ...newConfig };
    this.validateConfig(updatedConfig);
    this.config = updatedConfig;
  }
}