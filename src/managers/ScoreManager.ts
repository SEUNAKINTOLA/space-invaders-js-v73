/**
 * @fileoverview Score Management System
 * Handles the tracking, updating, and display of game scores
 * 
 * @module ScoreManager
 * @author AI Assistant
 * @version 1.0.0
 */

// =========================================
// Type Definitions
// =========================================

/**
 * Configuration options for the ScoreManager
 */
interface ScoreConfig {
  initialScore: number;
  maxScore?: number;
  minScore?: number;
  scoreMultiplier?: number;
}

/**
 * Score update event data structure
 */
interface ScoreUpdateEvent {
  previousScore: number;
  newScore: number;
  timestamp: Date;
}

/**
 * Observer callback type for score updates
 */
type ScoreUpdateCallback = (event: ScoreUpdateEvent) => void;

// =========================================
// Constants
// =========================================

const DEFAULT_CONFIG: ScoreConfig = {
  initialScore: 0,
  maxScore: Number.MAX_SAFE_INTEGER,
  minScore: 0,
  scoreMultiplier: 1
};

// =========================================
// Main Class Implementation
// =========================================

/**
 * Manages game scoring system with support for tracking, updating,
 * and notifying observers of score changes
 */
export class ScoreManager {
  private currentScore: number;
  private config: ScoreConfig;
  private observers: Set<ScoreUpdateCallback>;
  private static instance: ScoreManager;

  /**
   * Private constructor to enforce singleton pattern
   * @param config - Configuration options for score management
   */
  private constructor(config: Partial<ScoreConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore;
    this.observers = new Set();
  }

  /**
   * Gets the singleton instance of ScoreManager
   * @param config - Optional configuration for initial setup
   * @returns ScoreManager instance
   */
  public static getInstance(config?: Partial<ScoreConfig>): ScoreManager {
    if (!ScoreManager.instance) {
      ScoreManager.instance = new ScoreManager(config);
    }
    return ScoreManager.instance;
  }

  /**
   * Gets the current score
   * @returns Current score value
   */
  public getScore(): number {
    return this.currentScore;
  }

  /**
   * Updates the score by a given amount
   * @param points - Points to add (or subtract if negative)
   * @throws Error if resulting score would be outside min/max bounds
   */
  public updateScore(points: number): void {
    try {
      const previousScore = this.currentScore;
      const adjustedPoints = points * (this.config.scoreMultiplier ?? 1);
      const newScore = this.currentScore + adjustedPoints;

      // Validate new score against bounds
      if (newScore > (this.config.maxScore ?? Number.MAX_SAFE_INTEGER)) {
        throw new Error('Score would exceed maximum limit');
      }
      if (newScore < (this.config.minScore ?? 0)) {
        throw new Error('Score would fall below minimum limit');
      }

      this.currentScore = newScore;

      // Notify observers
      this.notifyObservers({
        previousScore,
        newScore,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }

  /**
   * Resets score to initial value
   */
  public resetScore(): void {
    const previousScore = this.currentScore;
    this.currentScore = this.config.initialScore;
    
    this.notifyObservers({
      previousScore,
      newScore: this.currentScore,
      timestamp: new Date()
    });
  }

  /**
   * Subscribes to score updates
   * @param callback - Function to call when score changes
   */
  public subscribe(callback: ScoreUpdateCallback): void {
    this.observers.add(callback);
  }

  /**
   * Unsubscribes from score updates
   * @param callback - Function to remove from observers
   */
  public unsubscribe(callback: ScoreUpdateCallback): void {
    this.observers.delete(callback);
  }

  /**
   * Updates configuration settings
   * @param newConfig - Partial configuration to update
   */
  public updateConfig(newConfig: Partial<ScoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Notifies all observers of score changes
   * @param event - Score update event data
   * @private
   */
  private notifyObservers(event: ScoreUpdateEvent): void {
    this.observers.forEach(observer => {
      try {
        observer(event);
      } catch (error) {
        console.error('Error in score update observer:', error);
      }
    });
  }
}

// Export default instance
export default ScoreManager.getInstance();