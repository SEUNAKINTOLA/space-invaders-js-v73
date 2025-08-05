/**
 * @file DifficultyManager.ts
 * @description Manages game difficulty scaling and progression through dynamic difficulty adjustment.
 * Provides methods to calculate and adjust difficulty based on player performance and game time.
 */

// Types and interfaces
export interface DifficultySettings {
  baseValue: number;
  scalingFactor: number;
  maxDifficulty: number;
  minDifficulty: number;
}

export interface DifficultyModifiers {
  timeModifier: number;
  performanceModifier: number;
  levelModifier: number;
}

/**
 * Represents different aspects of difficulty that can be adjusted
 */
export enum DifficultyAspect {
  ENEMY_HEALTH = 'enemyHealth',
  ENEMY_DAMAGE = 'enemyDamage',
  SPAWN_RATE = 'spawnRate',
  ENEMY_SPEED = 'enemySpeed'
}

/**
 * Default configuration for difficulty settings
 */
const DEFAULT_DIFFICULTY_SETTINGS: DifficultySettings = {
  baseValue: 1.0,
  scalingFactor: 0.1,
  maxDifficulty: 10.0,
  minDifficulty: 0.5
};

/**
 * Manages game difficulty scaling and adjustments
 */
export class DifficultyManager {
  private settings: DifficultySettings;
  private currentDifficulty: number;
  private gameTime: number;
  private performanceScore: number;
  private difficultyModifiers: Map<DifficultyAspect, number>;

  /**
   * Creates a new DifficultyManager instance
   * @param settings Optional custom difficulty settings
   */
  constructor(settings: Partial<DifficultySettings> = {}) {
    this.settings = { ...DEFAULT_DIFFICULTY_SETTINGS, ...settings };
    this.currentDifficulty = this.settings.baseValue;
    this.gameTime = 0;
    this.performanceScore = 1.0;
    this.difficultyModifiers = new Map();
    this.initializeDifficultyModifiers();
  }

  /**
   * Initializes default difficulty modifiers for each aspect
   * @private
   */
  private initializeDifficultyModifiers(): void {
    Object.values(DifficultyAspect).forEach(aspect => {
      this.difficultyModifiers.set(aspect, 1.0);
    });
  }

  /**
   * Updates the game time and recalculates difficulty
   * @param deltaTime Time elapsed since last update in seconds
   */
  public update(deltaTime: number): void {
    try {
      this.gameTime += deltaTime;
      this.calculateDifficulty();
    } catch (error) {
      console.error('Error updating difficulty:', error);
      // Maintain current difficulty in case of error
    }
  }

  /**
   * Calculates the current difficulty based on various factors
   * @private
   */
  private calculateDifficulty(): void {
    const timeScale = Math.log10(Math.max(this.gameTime, 1) + 1);
    const performanceScale = this.performanceScore;
    
    let newDifficulty = this.settings.baseValue +
      (timeScale * this.settings.scalingFactor * performanceScale);

    // Clamp difficulty between min and max values
    this.currentDifficulty = Math.min(
      Math.max(newDifficulty, this.settings.minDifficulty),
      this.settings.maxDifficulty
    );
  }

  /**
   * Updates the player performance score
   * @param score Player performance score (1.0 is baseline)
   */
  public updatePerformanceScore(score: number): void {
    if (score < 0) {
      throw new Error('Performance score cannot be negative');
    }
    this.performanceScore = score;
  }

  /**
   * Gets the difficulty multiplier for a specific aspect
   * @param aspect The difficulty aspect to get the multiplier for
   * @returns The calculated difficulty multiplier
   */
  public getDifficultyMultiplier(aspect: DifficultyAspect): number {
    const baseMultiplier = this.currentDifficulty;
    const aspectModifier = this.difficultyModifiers.get(aspect) ?? 1.0;
    return baseMultiplier * aspectModifier;
  }

  /**
   * Sets a specific modifier for a difficulty aspect
   * @param aspect The difficulty aspect to modify
   * @param modifier The modifier value
   */
  public setAspectModifier(aspect: DifficultyAspect, modifier: number): void {
    if (modifier < 0) {
      throw new Error('Difficulty modifier cannot be negative');
    }
    this.difficultyModifiers.set(aspect, modifier);
  }

  /**
   * Resets the difficulty manager to initial state
   */
  public reset(): void {
    this.currentDifficulty = this.settings.baseValue;
    this.gameTime = 0;
    this.performanceScore = 1.0;
    this.initializeDifficultyModifiers();
  }

  /**
   * Gets the current overall difficulty value
   * @returns The current difficulty value
   */
  public getCurrentDifficulty(): number {
    return this.currentDifficulty;
  }
}

/**
 * Creates a DifficultyManager instance with default settings
 * @returns A new DifficultyManager instance
 */
export function createDifficultyManager(): DifficultyManager {
  return new DifficultyManager();
}