/**
 * @file TouchButtons.ts
 * @description Implements touch-based virtual button controls for mobile devices.
 * Provides a customizable overlay with touch event handling and button management.
 * 
 * @module TouchButtons
 * @author AI Assistant
 * @version 1.0.0
 */

// --- Types and Interfaces ---

/**
 * Configuration options for virtual button
 */
interface ButtonConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  opacity?: number;
  visible?: boolean;
}

/**
 * Touch event handler type
 */
type TouchHandler = (event: TouchEvent) => void;

/**
 * Button state interface
 */
interface ButtonState {
  pressed: boolean;
  touchId: number | null;
  element: HTMLElement;
}

// --- Main Class ---

/**
 * Manages touch-based virtual buttons overlay for mobile interfaces
 */
export class TouchButtons {
  private readonly container: HTMLElement;
  private readonly buttons: Map<string, ButtonState>;
  private readonly handlers: Map<string, TouchHandler>;
  private isEnabled: boolean;

  /**
   * Creates a new TouchButtons instance
   * @param containerId - ID of the container element where buttons will be rendered
   * @throws Error if container element is not found
   */
  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }

    this.container = container;
    this.buttons = new Map();
    this.handlers = new Map();
    this.isEnabled = false;

    this.initializeContainer();
  }

  /**
   * Initializes the container element with necessary styles and event listeners
   * @private
   */
  private initializeContainer(): void {
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.pointerEvents = 'none';
    this.container.style.userSelect = 'none';
    this.container.style.touchAction = 'none';

    // Prevent default touch behaviors
    this.container.addEventListener('touchstart', (e) => e.preventDefault());
    this.container.addEventListener('touchmove', (e) => e.preventDefault());
    this.container.addEventListener('touchend', (e) => e.preventDefault());
  }

  /**
   * Adds a virtual button to the overlay
   * @param config - Button configuration options
   * @throws Error if button with same ID already exists
   */
  public addButton(config: ButtonConfig): void {
    if (this.buttons.has(config.id)) {
      throw new Error(`Button with id '${config.id}' already exists`);
    }

    const button = document.createElement('div');
    button.id = config.id;
    button.style.position = 'absolute';
    button.style.left = `${config.x}px`;
    button.style.top = `${config.y}px`;
    button.style.width = `${config.width}px`;
    button.style.height = `${config.height}px`;
    button.style.opacity = `${config.opacity ?? 0.5}`;
    button.style.visibility = config.visible === false ? 'hidden' : 'visible';
    
    if (config.label) {
      button.textContent = config.label;
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
    }

    this.container.appendChild(button);

    this.buttons.set(config.id, {
      pressed: false,
      touchId: null,
      element: button
    });

    this.setupButtonEventListeners(config.id);
  }

  /**
   * Sets up touch event listeners for a button
   * @param buttonId - ID of the button to setup
   * @private
   */
  private setupButtonEventListeners(buttonId: string): void {
    const buttonState = this.buttons.get(buttonId);
    if (!buttonState) return;

    const { element } = buttonState;

    element.addEventListener('touchstart', (e: TouchEvent) => {
      if (!this.isEnabled) return;
      
      const touch = e.touches[0];
      if (this.isPointInButton(touch.clientX, touch.clientY, element)) {
        buttonState.pressed = true;
        buttonState.touchId = touch.identifier;
        this.handlers.get(buttonId)?.(e);
      }
    });

    element.addEventListener('touchend', (e: TouchEvent) => {
      if (!this.isEnabled) return;
      
      if (buttonState.pressed) {
        buttonState.pressed = false;
        buttonState.touchId = null;
        this.handlers.get(buttonId)?.(e);
      }
    });
  }

  /**
   * Checks if a point is within a button's bounds
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param button - Button element
   * @returns boolean indicating if point is in button
   * @private
   */
  private isPointInButton(x: number, y: number, button: HTMLElement): boolean {
    const rect = button.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  /**
   * Sets a touch event handler for a button
   * @param buttonId - ID of the button
   * @param handler - Touch event handler function
   * @throws Error if button doesn't exist
   */
  public setButtonHandler(buttonId: string, handler: TouchHandler): void {
    if (!this.buttons.has(buttonId)) {
      throw new Error(`Button with id '${buttonId}' not found`);
    }
    this.handlers.set(buttonId, handler);
  }

  /**
   * Enables or disables the touch controls
   * @param enabled - Whether to enable or disable
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.container.style.pointerEvents = enabled ? 'auto' : 'none';
  }

  /**
   * Removes a button from the overlay
   * @param buttonId - ID of the button to remove
   */
  public removeButton(buttonId: string): void {
    const buttonState = this.buttons.get(buttonId);
    if (buttonState) {
      buttonState.element.remove();
      this.buttons.delete(buttonId);
      this.handlers.delete(buttonId);
    }
  }

  /**
   * Cleans up all buttons and event listeners
   */
  public dispose(): void {
    this.buttons.forEach((state) => state.element.remove());
    this.buttons.clear();
    this.handlers.clear();
    this.container.remove();
  }
}