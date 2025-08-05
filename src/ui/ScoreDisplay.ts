/**
 * @file ScoreDisplay.ts
 * @description A reusable score display component that handles score visualization and updates
 * @module ScoreDisplay
 */

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Configuration options for the ScoreDisplay component
 */
interface ScoreDisplayConfig {
  initialScore?: number;
  animationDuration?: number;
  formatScore?: (score: number) => string;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<ScoreDisplayConfig> = {
  initialScore: 0,
  animationDuration: 500,
  formatScore: (score: number) => score.toLocaleString(),
};

/**
 * ScoreDisplay class handles the visualization and management of game scores
 */
export class ScoreDisplay {
  private currentScore: number;
  private targetScore: number;
  private element: HTMLElement | null;
  private config: Required<ScoreDisplayConfig>;
  private destroy$ = new Subject<void>();
  private scoreUpdate$ = new Subject<number>();

  /**
   * Creates a new ScoreDisplay instance
   * @param elementId - The ID of the HTML element to attach the score display to
   * @param config - Configuration options for the score display
   */
  constructor(
    private readonly elementId: string,
    config: ScoreDisplayConfig = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore;
    this.targetScore = this.config.initialScore;
    this.element = null;
    this.initialize();
  }

  /**
   * Initializes the score display component
   * @throws {Error} If the specified element ID is not found in the DOM
   */
  private initialize(): void {
    try {
      this.element = document.getElementById(this.elementId);
      if (!this.element) {
        throw new Error(`Element with ID "${this.elementId}" not found`);
      }

      this.setupScoreUpdates();
      this.render();
    } catch (error) {
      console.error('Failed to initialize ScoreDisplay:', error);
      throw error;
    }
  }

  /**
   * Sets up the score update subscription
   */
  private setupScoreUpdates(): void {
    this.scoreUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((newScore) => {
        this.animateScoreChange(newScore);
      });
  }

  /**
   * Updates the score with animation
   * @param newScore - The new score value to animate to
   */
  private animateScoreChange(newScore: number): void {
    if (!this.element) return;

    this.targetScore = newScore;
    const startScore = this.currentScore;
    const scoreChange = this.targetScore - startScore;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.animationDuration, 1);

      // Use easeOutQuad easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      this.currentScore = startScore + scoreChange * easeProgress;

      this.render();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Renders the current score to the DOM
   */
  private render(): void {
    if (!this.element) return;

    const formattedScore = this.config.formatScore(Math.round(this.currentScore));
    this.element.textContent = formattedScore;
  }

  /**
   * Updates the score value
   * @param newScore - The new score value
   */
  public updateScore(newScore: number): void {
    if (typeof newScore !== 'number' || isNaN(newScore)) {
      console.error('Invalid score value:', newScore);
      return;
    }

    this.scoreUpdate$.next(newScore);
  }

  /**
   * Gets the current score value
   * @returns The current score
   */
  public getCurrentScore(): number {
    return Math.round(this.currentScore);
  }

  /**
   * Resets the score to the initial value
   */
  public reset(): void {
    this.updateScore(this.config.initialScore);
  }

  /**
   * Cleans up resources when the component is destroyed
   */
  public destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Factory function to create a new ScoreDisplay instance
 * @param elementId - The ID of the HTML element to attach the score display to
 * @param config - Configuration options for the score display
 * @returns A new ScoreDisplay instance
 */
export function createScoreDisplay(
  elementId: string,
  config?: ScoreDisplayConfig
): ScoreDisplay {
  return new ScoreDisplay(elementId, config);
}