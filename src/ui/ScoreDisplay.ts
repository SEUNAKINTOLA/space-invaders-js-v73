/**
 * @fileoverview Score Display Component
 * Handles the rendering and updating of game scores in the UI.
 * 
 * @module ScoreDisplay
 * @author AI Assistant
 * @version 1.0.0
 */

// =========================================================
// Types and Interfaces
// =========================================================

/**
 * Configuration options for the ScoreDisplay component
 */
interface ScoreDisplayConfig {
  initialScore?: number;
  minScore?: number;
  maxScore?: number;
  animationDuration?: number;
  format?: 'numeric' | 'formatted';
}

/**
 * Events that can be emitted by the ScoreDisplay
 */
interface ScoreDisplayEvents {
  onScoreChange?: (newScore: number) => void;
  onMaxScoreReached?: () => void;
  onMinScoreReached?: () => void;
}

// =========================================================
// Constants
// =========================================================

const DEFAULT_CONFIG: ScoreDisplayConfig = {
  initialScore: 0,
  minScore: 0,
  maxScore: 999999,
  animationDuration: 500,
  format: 'numeric'
};

// =========================================================
// Main Class
// =========================================================

/**
 * ScoreDisplay class handles the display and management of game scores
 * in the UI with optional animation and formatting features.
 */
export class ScoreDisplay {
  private currentScore: number;
  private element: HTMLElement | null;
  private config: ScoreDisplayConfig;
  private events: ScoreDisplayEvents;
  private animationFrame: number | null;

  /**
   * Creates a new ScoreDisplay instance
   * @param elementId - The ID of the HTML element to display the score
   * @param config - Configuration options for the score display
   * @param events - Event handlers for score-related events
   */
  constructor(
    elementId: string,
    config: ScoreDisplayConfig = {},
    events: ScoreDisplayEvents = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.events = events;
    this.currentScore = this.config.initialScore!;
    this.element = document.getElementById(elementId);
    this.animationFrame = null;

    this.validateConfig();
    this.initialize();
  }

  /**
   * Validates the configuration options
   * @throws {Error} If configuration is invalid
   */
  private validateConfig(): void {
    if (this.config.minScore! > this.config.maxScore!) {
      throw new Error('Minimum score cannot be greater than maximum score');
    }

    if (this.config.initialScore! < this.config.minScore! || 
        this.config.initialScore! > this.config.maxScore!) {
      throw new Error('Initial score must be between minimum and maximum scores');
    }
  }

  /**
   * Initializes the score display
   * @throws {Error} If the element is not found
   */
  private initialize(): void {
    if (!this.element) {
      throw new Error(`Element with ID not found`);
    }

    this.updateDisplay(this.currentScore);
  }

  /**
   * Updates the score with optional animation
   * @param newScore - The new score value
   * @returns {boolean} Success status of the update
   */
  public updateScore(newScore: number): boolean {
    if (newScore < this.config.minScore! || newScore > this.config.maxScore!) {
      console.warn('Score update ignored: Value out of bounds');
      return false;
    }

    const oldScore = this.currentScore;
    this.currentScore = newScore;

    if (this.config.animationDuration! > 0) {
      this.animateScore(oldScore, newScore);
    } else {
      this.updateDisplay(newScore);
    }

    this.emitEvents(newScore);
    return true;
  }

  /**
   * Formats the score according to configuration
   * @param score - The score to format
   * @returns {string} Formatted score
   */
  private formatScore(score: number): string {
    if (this.config.format === 'formatted') {
      return new Intl.NumberFormat().format(score);
    }
    return score.toString();
  }

  /**
   * Updates the display with the current score
   * @param score - The score to display
   */
  private updateDisplay(score: number): void {
    if (this.element) {
      this.element.textContent = this.formatScore(score);
    }
  }

  /**
   * Animates the score change
   * @param fromScore - Starting score
   * @param toScore - Ending score
   */
  private animateScore(fromScore: number, toScore: number): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const startTime = performance.now();
    const difference = toScore - fromScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.animationDuration!, 1);

      const currentValue = Math.round(fromScore + (difference * progress));
      this.updateDisplay(currentValue);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Emits events based on score changes
   * @param newScore - The new score value
   */
  private emitEvents(newScore: number): void {
    if (this.events.onScoreChange) {
      this.events.onScoreChange(newScore);
    }

    if (newScore === this.config.maxScore! && this.events.onMaxScoreReached) {
      this.events.onMaxScoreReached();
    }

    if (newScore === this.config.minScore! && this.events.onMinScoreReached) {
      this.events.onMinScoreReached();
    }
  }

  /**
   * Gets the current score
   * @returns {number} Current score
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Cleans up resources used by the component
   */
  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.element = null;
  }
}

export default ScoreDisplay;