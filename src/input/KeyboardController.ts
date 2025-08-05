/**
 * @file KeyboardController.ts
 * @description Handles keyboard input for player movement controls
 * @module input
 */

// Types for keyboard events and movement states
type MovementDirection = 'left' | 'right' | 'none';
type KeyState = {
  [key: string]: boolean;
};

/**
 * Configuration for keyboard controls
 */
const KEYBOARD_CONFIG = {
  LEFT_KEYS: ['ArrowLeft', 'a', 'A'],
  RIGHT_KEYS: ['ArrowRight', 'd', 'D'],
  UPDATE_INTERVAL: 1000 / 60, // 60 FPS
} as const;

/**
 * Handles keyboard input for player movement
 * @class KeyboardController
 */
export class KeyboardController {
  private keyState: KeyState;
  private currentDirection: MovementDirection;
  private isEnabled: boolean;
  private listeners: Set<(direction: MovementDirection) => void>;

  /**
   * Creates an instance of KeyboardController
   */
  constructor() {
    this.keyState = {};
    this.currentDirection = 'none';
    this.isEnabled = false;
    this.listeners = new Set();

    // Bind methods to maintain correct 'this' context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Initializes the keyboard controller and sets up event listeners
   * @returns {void}
   */
  public initialize(): void {
    if (this.isEnabled) {
      return;
    }

    try {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      this.isEnabled = true;
    } catch (error) {
      console.error('Failed to initialize keyboard controller:', error);
      throw new Error('Keyboard controller initialization failed');
    }
  }

  /**
   * Cleans up event listeners and resources
   * @returns {void}
   */
  public dispose(): void {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      this.isEnabled = false;
      this.keyState = {};
      this.currentDirection = 'none';
      this.listeners.clear();
    } catch (error) {
      console.error('Failed to dispose keyboard controller:', error);
    }
  }

  /**
   * Adds a movement change listener
   * @param {Function} listener - Callback function for movement changes
   * @returns {void}
   */
  public addMovementListener(listener: (direction: MovementDirection) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Removes a movement change listener
   * @param {Function} listener - Callback function to remove
   * @returns {void}
   */
  public removeMovementListener(listener: (direction: MovementDirection) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Gets the current movement direction
   * @returns {MovementDirection} Current movement direction
   */
  public getCurrentDirection(): MovementDirection {
    return this.currentDirection;
  }

  /**
   * Handles keydown events
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) {
      return;
    }

    this.keyState[event.key] = true;
    this.updateMovementDirection();
  }

  /**
   * Handles keyup events
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isEnabled) {
      return;
    }

    this.keyState[event.key] = false;
    this.updateMovementDirection();
  }

  /**
   * Updates the current movement direction based on key states
   * @private
   */
  private updateMovementDirection(): void {
    const previousDirection = this.currentDirection;
    let newDirection: MovementDirection = 'none';

    // Check for left movement
    const isLeftPressed = KEYBOARD_CONFIG.LEFT_KEYS.some(key => this.keyState[key]);
    // Check for right movement
    const isRightPressed = KEYBOARD_CONFIG.RIGHT_KEYS.some(key => this.keyState[key]);

    if (isLeftPressed && isRightPressed) {
      newDirection = 'none'; // Cancel out opposing directions
    } else if (isLeftPressed) {
      newDirection = 'left';
    } else if (isRightPressed) {
      newDirection = 'right';
    }

    // Only notify listeners if direction has changed
    if (previousDirection !== newDirection) {
      this.currentDirection = newDirection;
      this.notifyListeners();
    }
  }

  /**
   * Notifies all movement listeners of direction changes
   * @private
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentDirection);
      } catch (error) {
        console.error('Error in movement listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const keyboardController = new KeyboardController();