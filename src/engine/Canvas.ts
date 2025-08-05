/**
 * @file Canvas.ts
 * @description Canvas management module that handles HTML5 Canvas initialization and rendering
 * @module engine/Canvas
 */

// Types and interfaces
interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  id?: string;
}

type RenderCallback = (ctx: CanvasRenderingContext2D) => void;

/**
 * Default configuration for canvas initialization
 */
const DEFAULT_CONFIG: CanvasConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  id: 'gameCanvas'
};

/**
 * Canvas class responsible for managing the HTML5 Canvas element
 * and providing basic rendering capabilities
 */
export class Canvas {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private config: CanvasConfig;
  private isInitialized: boolean = false;

  /**
   * Creates a new Canvas instance
   * @param config - Optional configuration for canvas initialization
   */
  constructor(config: Partial<CanvasConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initializes the canvas element and context
   * @throws Error if canvas initialization fails
   * @returns void
   */
  public init(): void {
    try {
      // Create canvas element
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
      this.canvas.id = this.config.id!;

      // Get rendering context
      const context = this.canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2D rendering context');
      }
      this.context = context;

      // Append canvas to document body
      document.body.appendChild(this.canvas);

      // Set initial background
      this.setBackground(this.config.backgroundColor!);

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Canvas initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Renders content to the canvas using a callback function
   * @param callback - Function to execute for rendering
   * @throws Error if canvas is not initialized
   * @returns void
   */
  public render(callback: RenderCallback): void {
    if (!this.isInitialized || !this.context) {
      throw new Error('Canvas must be initialized before rendering');
    }

    try {
      // Clear canvas before rendering
      this.clear();
      
      // Execute render callback
      callback(this.context);
    } catch (error) {
      console.error('Render error:', error);
      throw new Error(`Render failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears the canvas
   * @throws Error if canvas is not initialized
   * @returns void
   */
  public clear(): void {
    if (!this.isInitialized || !this.context || !this.canvas) {
      throw new Error('Canvas must be initialized before clearing');
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Sets the background color of the canvas
   * @param color - Color to set as background
   * @throws Error if canvas is not initialized
   * @returns void
   */
  public setBackground(color: string): void {
    if (!this.isInitialized || !this.context || !this.canvas) {
      throw new Error('Canvas must be initialized before setting background');
    }

    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Gets the canvas element
   * @returns HTMLCanvasElement or null if not initialized
   */
  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Gets the rendering context
   * @returns CanvasRenderingContext2D or null if not initialized
   */
  public getContext(): CanvasRenderingContext2D | null {
    return this.context;
  }

  /**
   * Gets the canvas dimensions
   * @returns Object containing width and height
   */
  public getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width,
      height: this.config.height
    };
  }

  /**
   * Checks if canvas is initialized
   * @returns boolean indicating initialization status
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

export default Canvas;