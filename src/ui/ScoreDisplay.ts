/**
 * @fileoverview Score Display Component
 * Manages and renders the scoring system UI component.
 * Handles score updates, animations, and display formatting.
 * 
 * @module ScoreDisplay
 */

// ======= Imports =======
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// ======= Types =======
interface ScoreConfig {
  initialValue: number;
  minValue: number;
  maxValue: number;
  animationDuration: number;
}

interface ScoreUpdateEvent {
  value: number;
  reason?: string;
}

// ======= Constants =======
const DEFAULT_CONFIG: ScoreConfig = {
  initialValue: 0,
  minValue: 0,
  maxValue: 999999,
  animationDuration: 500,
};

/**
 * ScoreDisplay class handles the rendering and management of a score display component.
 * Supports animated transitions, formatting, and reactive updates.
 */
export class ScoreDisplay {
  private currentScore: number;
  private element: HTMLElement | null;
  private config: ScoreConfig;
  private destroy$ = new Subject<void>();
  private scoreUpdate$ = new Subject<ScoreUpdateEvent>();

  /**
   * Creates a new ScoreDisplay instance
   * @param elementId - DOM element ID where the score will be displayed
   * @param config - Optional configuration for the score display
   */
  constructor(
    private readonly elementId: string,
    config: Partial<ScoreConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialValue;
    this.element = null;
    this.initialize();
  }

  /**
   * Initializes the score display component
   * @throws {Error} If the specified element ID is not found
   */
  private initialize(): void {
    try {
      this.element = document.getElementById(this.elementId);
      if (!this.element) {
        throw new Error(`Element with ID '${this.elementId}' not found`);
      }

      this.setupSubscriptions();
      this.render();
    } catch (error) {
      console.error('Failed to initialize ScoreDisplay:', error);
      throw error;
    }
  }

  /**
   * Sets up reactive subscriptions for score updates
   */
  private setupSubscriptions(): void {
    this.scoreUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.handleScoreUpdate(event);
      });
  }

  /**
   * Updates the score with optional animation
   * @param value - New score value
   * @param reason - Optional reason for the score update
   */
  public updateScore(value: number, reason?: string): void {
    if (!this.isValidScore(value)) {
      console.warn(`Invalid score value: ${value}`);
      return;
    }

    this.scoreUpdate$.next({ value, reason });
  }

  /**
   * Handles score update events and triggers animation
   * @param event - Score update event
   */
  private handleScoreUpdate(event: ScoreUpdateEvent): void {
    const oldScore = this.currentScore;
    this.currentScore = this.clampScore(event.value);

    if (this.config.animationDuration > 0) {
      this.animateScore(oldScore, this.currentScore);
    } else {
      this.render();
    }
  }

  /**
   * Animates the score transition
   * @param from - Starting score
   * @param to - Ending score
   */
  private animateScore(from: number, to: number): void {
    const startTime = performance.now();
    const difference = to - from;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.animationDuration, 1);

      const currentValue = from + difference * this.easeOutQuad(progress);
      this.render(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Easing function for smooth animations
   * @param t - Progress value between 0 and 1
   */
  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  /**
   * Renders the current score to the DOM
   * @param value - Optional value to render (defaults to currentScore)
   */
  private render(value?: number): void {
    if (!this.element) return;

    const scoreToRender = value ?? this.currentScore;
    this.element.textContent = this.formatScore(scoreToRender);
  }

  /**
   * Formats the score for display
   * @param score - Score value to format
   */
  private formatScore(score: number): string {
    return score.toLocaleString();
  }

  /**
   * Validates if a score value is within acceptable range
   * @param value - Score value to validate
   */
  private isValidScore(value: number): boolean {
    return !isNaN(value) && isFinite(value);
  }

  /**
   * Clamps score value between min and max bounds
   * @param value - Score value to clamp
   */
  private clampScore(value: number): number {
    return Math.min(
      Math.max(value, this.config.minValue),
      this.config.maxValue
    );
  }

  /**
   * Gets the current score value
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Cleans up resources and subscriptions
   */
  public destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Export types for external use
export type { ScoreConfig, ScoreUpdateEvent };