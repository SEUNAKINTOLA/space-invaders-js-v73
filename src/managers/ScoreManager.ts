/**
 * @file ScoreManager.ts
 * @description Manages game scoring system, including tracking, updating, and displaying scores
 * @module ScoreManager
 */

// ====== Types & Interfaces ======

/**
 * Configuration options for the score manager
 */
interface ScoreConfig {
  initialScore: number;
  maxScore?: number;
  minScore?: number;
  multiplier?: number;
}

/**
 * Score update event data structure
 */
interface ScoreUpdateEvent {
  previousScore: number;
  currentScore: number;
  difference: number;
  timestamp: Date;
}

/**
 * Score history entry structure
 */
interface ScoreHistoryEntry {
  score: number;
  reason?: string;
  timestamp: Date;
}

// ====== Constants ======

const DEFAULT_CONFIG: ScoreConfig = {
  initialScore: 0,
  maxScore: Number.MAX_SAFE_INTEGER,
  minScore: 0,
  multiplier: 1,
};

// ====== Class Implementation ======

/**
 * Manages game scoring system with features like score tracking,
 * history, multipliers, and event handling
 */
export class ScoreManager {
  private currentScore: number;
  private readonly config: ScoreConfig;
  private scoreHistory: ScoreHistoryEntry[];
  private scoreUpdateCallbacks: ((event: ScoreUpdateEvent) => void)[];

  /**
   * Creates a new ScoreManager instance
   * @param config - Configuration options for the score manager
   */
  constructor(config: Partial<ScoreConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore;
    this.scoreHistory = [];
    this.scoreUpdateCallbacks = [];
    
    this.validateConfig();
  }

  /**
   * Validates the configuration settings
   * @throws Error if configuration is invalid
   */
  private validateConfig(): void {
    if (this.config.maxScore! < this.config.minScore!) {
      throw new Error('Maximum score cannot be less than minimum score');
    }
    if (this.config.multiplier! <= 0) {
      throw new Error('Multiplier must be greater than 0');
    }
  }

  /**
   * Gets the current score
   * @returns Current score value
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Adds points to the current score
   * @param points - Number of points to add
   * @param reason - Optional reason for the score change
   * @returns Updated score value
   * @throws Error if resulting score would exceed limits
   */
  public addPoints(points: number, reason?: string): number {
    const adjustedPoints = points * this.config.multiplier!;
    const newScore = this.currentScore + adjustedPoints;

    if (newScore > this.config.maxScore!) {
      throw new Error(`Score cannot exceed maximum value of ${this.config.maxScore}`);
    }

    const previousScore = this.currentScore;
    this.currentScore = newScore;

    this.recordHistory(newScore, reason);
    this.notifyScoreUpdate(previousScore, newScore, adjustedPoints);

    return this.currentScore;
  }

  /**
   * Subtracts points from the current score
   * @param points - Number of points to subtract
   * @param reason - Optional reason for the score change
   * @returns Updated score value
   * @throws Error if resulting score would go below minimum
   */
  public subtractPoints(points: number, reason?: string): number {
    const adjustedPoints = points * this.config.multiplier!;
    const newScore = this.currentScore - adjustedPoints;

    if (newScore < this.config.minScore!) {
      throw new Error(`Score cannot go below minimum value of ${this.config.minScore}`);
    }

    const previousScore = this.currentScore;
    this.currentScore = newScore;

    this.recordHistory(newScore, reason);
    this.notifyScoreUpdate(previousScore, newScore, -adjustedPoints);

    return this.currentScore;
  }

  /**
   * Resets the score to initial value
   */
  public resetScore(): void {
    const previousScore = this.currentScore;
    this.currentScore = this.config.initialScore;
    
    this.recordHistory(this.currentScore, 'Score reset');
    this.notifyScoreUpdate(
      previousScore,
      this.currentScore,
      this.currentScore - previousScore
    );
  }

  /**
   * Records a score change in history
   * @param score - New score value
   * @param reason - Optional reason for the change
   */
  private recordHistory(score: number, reason?: string): void {
    this.scoreHistory.push({
      score,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Gets the score history
   * @returns Array of score history entries
   */
  public getScoreHistory(): ReadonlyArray<ScoreHistoryEntry> {
    return [...this.scoreHistory];
  }

  /**
   * Registers a callback for score updates
   * @param callback - Function to call when score changes
   */
  public onScoreUpdate(callback: (event: ScoreUpdateEvent) => void): void {
    this.scoreUpdateCallbacks.push(callback);
  }

  /**
   * Notifies all registered callbacks of a score update
   * @param previousScore - Score before the update
   * @param currentScore - Score after the update
   * @param difference - Point difference
   */
  private notifyScoreUpdate(
    previousScore: number,
    currentScore: number,
    difference: number
  ): void {
    const event: ScoreUpdateEvent = {
      previousScore,
      currentScore,
      difference,
      timestamp: new Date(),
    };

    this.scoreUpdateCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in score update callback:', error);
      }
    });
  }

  /**
   * Updates the score multiplier
   * @param multiplier - New multiplier value
   * @throws Error if multiplier is invalid
   */
  public setMultiplier(multiplier: number): void {
    if (multiplier <= 0) {
      throw new Error('Multiplier must be greater than 0');
    }
    this.config.multiplier = multiplier;
  }
}

export default ScoreManager;