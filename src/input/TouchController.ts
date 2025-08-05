/**
 * @file TouchController.ts
 * @description Handles touch input events for mobile devices with support for common touch gestures
 * @module input/TouchController
 */

// Types for touch events and callbacks
type TouchCallback = (event: TouchEvent) => void;
type GestureCallback = (data: GestureData) => void;

interface GestureData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
}

interface TouchControllerConfig {
  element: HTMLElement;
  swipeThreshold?: number;
  tapTimeout?: number;
  doubleTapTimeout?: number;
}

/**
 * TouchController class handles touch input events and gesture recognition
 * for mobile devices.
 */
export class TouchController {
  private readonly element: HTMLElement;
  private readonly swipeThreshold: number;
  private readonly tapTimeout: number;
  private readonly doubleTapTimeout: number;

  private touchStartTime: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private lastTapTime: number = 0;

  private callbacks: Map<string, Set<TouchCallback | GestureCallback>> = new Map();

  /**
   * Creates a new TouchController instance
   * @param config - Configuration options for the touch controller
   */
  constructor(config: TouchControllerConfig) {
    this.element = config.element;
    this.swipeThreshold = config.swipeThreshold || 50;
    this.tapTimeout = config.tapTimeout || 200;
    this.doubleTapTimeout = config.doubleTapTimeout || 300;

    this.initializeEventListeners();
  }

  /**
   * Initialize touch event listeners
   * @private
   */
  private initializeEventListeners(): void {
    try {
      this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
      this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    } catch (error) {
      console.error('Failed to initialize touch event listeners:', error);
      throw new Error('Touch event initialization failed');
    }
  }

  /**
   * Add an event listener for a specific touch event
   * @param eventName - Name of the event to listen for
   * @param callback - Callback function to execute
   */
  public on(eventName: string, callback: TouchCallback | GestureCallback): void {
    if (!this.callbacks.has(eventName)) {
      this.callbacks.set(eventName, new Set());
    }
    this.callbacks.get(eventName)?.add(callback);
  }

  /**
   * Remove an event listener
   * @param eventName - Name of the event to remove
   * @param callback - Callback function to remove
   */
  public off(eventName: string, callback: TouchCallback | GestureCallback): void {
    this.callbacks.get(eventName)?.delete(callback);
  }

  /**
   * Handle touch start event
   * @private
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;

    this.emit('touchstart', event);
  }

  /**
   * Handle touch move event
   * @private
   */
  private handleTouchMove(event: TouchEvent): void {
    this.emit('touchmove', event);
  }

  /**
   * Handle touch end event
   * @private
   */
  private handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const duration = Date.now() - this.touchStartTime;

    const gestureData: GestureData = {
      startX: this.touchStartX,
      startY: this.touchStartY,
      endX: touch.clientX,
      endY: touch.clientY,
      deltaX,
      deltaY,
      duration
    };

    this.recognizeGesture(gestureData);
    this.emit('touchend', event);
  }

  /**
   * Recognize and emit gesture events
   * @private
   */
  private recognizeGesture(data: GestureData): void {
    // Handle swipes
    if (Math.abs(data.deltaX) > this.swipeThreshold || Math.abs(data.deltaY) > this.swipeThreshold) {
      if (Math.abs(data.deltaX) > Math.abs(data.deltaY)) {
        // Horizontal swipe
        this.emit(data.deltaX > 0 ? 'swiperight' : 'swipeleft', data);
      } else {
        // Vertical swipe
        this.emit(data.deltaY > 0 ? 'swipedown' : 'swipeup', data);
      }
      return;
    }

    // Handle taps
    if (data.duration < this.tapTimeout) {
      const now = Date.now();
      if (now - this.lastTapTime < this.doubleTapTimeout) {
        this.emit('doubletap', data);
        this.lastTapTime = 0;
      } else {
        this.emit('tap', data);
        this.lastTapTime = now;
      }
    }
  }

  /**
   * Emit an event to all registered callbacks
   * @private
   */
  private emit(eventName: string, data: TouchEvent | GestureData): void {
    this.callbacks.get(eventName)?.forEach(callback => {
      try {
        callback(data as any);
      } catch (error) {
        console.error(`Error in ${eventName} callback:`, error);
      }
    });
  }

  /**
   * Clean up event listeners and references
   */
  public destroy(): void {
    try {
      this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
      this.callbacks.clear();
    } catch (error) {
      console.error('Error during TouchController cleanup:', error);
    }
  }
}