/**
 * @file ScoreManager.ts
 * @description Manages game scoring system, including tracking, calculation, and display
 * @module ScoreManager
 */

// ======= Types =======
/**
 * Represents a score event with type and value
 */
export interface ScoreEvent {
  type: ScoreEventType;
  value: number;
  timestamp: number;
}

/**
 * Available types of scoring events
 */
export enum ScoreEventType {
  POINTS = 'POINTS',
  BONUS = 'BONUS',
  MULTIPLIER = 'MULTIPLIER',
  PENALTY = 'PENALTY'
}

/**
 * Configuration for score calculations
 */
interface ScoreConfig {
  baseMultiplier: number;
  bonusThreshold: number;
  maxMultiplier: number;
  penaltyFactor: number;
}

// ======= Constants =======
const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  baseMultiplier: 1,
  bonusThreshold: 1000,
  maxMultiplier: 5,
  penaltyFactor: 0.5
};

/**
 * Manages game scoring system including tracking, calculation, and events
 */
export class ScoreManager {
  private currentScore: number = 0;
  private highScore: number = 0;
  private multiplier: number = 1;
  private scoreHistory: ScoreEvent[] = [];
  private config: ScoreConfig;
  private subscribers: ((score: number) => void)[] = [];

  /**
   * Creates a new ScoreManager instance
   * @param config Optional configuration for score calculations
   */
  constructor(config: Partial<ScoreConfig> = {}) {
    this.config = { ...DEFAULT_SCORE_CONFIG, ...config };
    this.loadHighScore();
  }

  /**
   * Adds points to the current score
   * @param points Number of points to add
   * @throws Error if points is negative
   */
  public addPoints(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }

    const calculatedPoints = points * this.multiplier;
    this.currentScore += calculatedPoints;

    this.addScoreEvent({
      type: ScoreEventType.POINTS,
      value: calculatedPoints,
      timestamp: Date.now()
    });

    this.checkBonusThreshold();
    this.notifySubscribers();
  }

  /**
   * Applies a score multiplier
   * @param multiplier Multiplier value
   */
  public setMultiplier(multiplier: number): void {
    this.multiplier = Math.min(
      Math.max(1, multiplier),
      this.config.maxMultiplier
    );

    this.addScoreEvent({
      type: ScoreEventType.MULTIPLIER,
      value: this.multiplier,
      timestamp: Date.now()
    });
  }

  /**
   * Applies a penalty to the current score
   * @param penalty Penalty value
   */
  public applyPenalty(penalty: number): void {
    const penaltyAmount = penalty * this.config.penaltyFactor;
    this.currentScore = Math.max(0, this.currentScore - penaltyAmount);

    this.addScoreEvent({
      type: ScoreEventType.PENALTY,
      value: penaltyAmount,
      timestamp: Date.now()
    });

    this.notifySubscribers();
  }

  /**
   * Gets the current score
   */
  public getCurrentScore(): number {
    return Math.floor(this.currentScore);
  }

  /**
   * Gets the current high score
   */
  public getHighScore(): number {
    return this.highScore;
  }

  /**
   * Resets the current score to zero
   */
  public resetScore(): void {
    this.updateHighScore();
    this.currentScore = 0;
    this.multiplier = this.config.baseMultiplier;
    this.scoreHistory = [];
    this.notifySubscribers();
  }

  /**
   * Subscribe to score updates
   * @param callback Callback function to be called when score changes
   */
  public subscribe(callback: (score: number) => void): void {
    this.subscribers.push(callback);
  }

  /**
   * Unsubscribe from score updates
   * @param callback Callback function to remove
   */
  public unsubscribe(callback: (score: number) => void): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  /**
   * Gets the score history
   */
  public getScoreHistory(): ScoreEvent[] {
    return [...this.scoreHistory];
  }

  // ======= Private Methods =======

  private addScoreEvent(event: ScoreEvent): void {
    this.scoreHistory.push(event);
  }

  private checkBonusThreshold(): void {
    if (this.currentScore >= this.config.bonusThreshold) {
      this.addScoreEvent({
        type: ScoreEventType.BONUS,
        value: this.config.bonusThreshold,
        timestamp: Date.now()
      });
    }
  }

  private notifySubscribers(): void {
    const currentScore = this.getCurrentScore();
    this.subscribers.forEach(callback => callback(currentScore));
  }

  private updateHighScore(): void {
    if (this.currentScore > this.highScore) {
      this.highScore = Math.floor(this.currentScore);
      this.saveHighScore();
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem('highScore', this.highScore.toString());
    } catch (error) {
      console.warn('Failed to save high score:', error);
    }
  }

  private loadHighScore(): void {
    try {
      const savedScore = localStorage.getItem('highScore');
      if (savedScore) {
        this.highScore = parseInt(savedScore, 10);
      }
    } catch (error) {
      console.warn('Failed to load high score:', error);
    }
  }
}

export default ScoreManager;