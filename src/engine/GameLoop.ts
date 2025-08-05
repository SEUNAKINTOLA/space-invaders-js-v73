/**
 * @file GameLoop.ts
 * @description Implements a fixed timestep game loop with frame interpolation.
 * This game loop ensures consistent update timing while allowing for smooth rendering.
 * 
 * Features:
 * - Fixed timestep updates for consistent game logic
 * - Frame interpolation for smooth rendering
 * - FPS monitoring and statistics
 * - Configurable update rate
 * - Panic mode for handling slow performance
 */

// Constants for game loop configuration
const DEFAULT_FPS = 60;
const DEFAULT_FRAME_TIME = 1000 / DEFAULT_FPS;
const MAX_UPDATES_PER_FRAME = 10;

/**
 * Statistics interface for monitoring game loop performance
 */
interface GameLoopStats {
    fps: number;
    frameTime: number;
    updates: number;
    renders: number;
}

/**
 * Callback functions interface for game loop events
 */
interface GameLoopCallbacks {
    update: (deltaTime: number) => void;
    render: (interpolation: number) => void;
    onPanic?: () => void;
}

/**
 * Configuration options for the game loop
 */
interface GameLoopOptions {
    fps?: number;
    enableStats?: boolean;
    maxUpdatesPerFrame?: number;
}

/**
 * Main game loop class implementing fixed timestep updates with interpolated rendering
 */
export class GameLoop {
    private fps: number;
    private frameTime: number;
    private maxUpdatesPerFrame: number;
    private running: boolean;
    private lastTime: number;
    private accumulated: number;
    private stats: GameLoopStats;
    private statsInterval: number;
    private callbacks: GameLoopCallbacks;
    private rafId: number;

    /**
     * Creates a new GameLoop instance
     * @param callbacks - Object containing update and render callback functions
     * @param options - Configuration options for the game loop
     */
    constructor(callbacks: GameLoopCallbacks, options: GameLoopOptions = {}) {
        this.validateCallbacks(callbacks);
        
        this.fps = options.fps || DEFAULT_FPS;
        this.frameTime = 1000 / this.fps;
        this.maxUpdatesPerFrame = options.maxUpdatesPerFrame || MAX_UPDATES_PER_FRAME;
        this.running = false;
        this.lastTime = 0;
        this.accumulated = 0;
        this.callbacks = callbacks;
        this.rafId = 0;

        this.stats = {
            fps: 0,
            frameTime: 0,
            updates: 0,
            renders: 0,
        };

        if (options.enableStats) {
            this.initializeStatsTracking();
        }
    }

    /**
     * Starts the game loop
     */
    public start(): void {
        if (this.running) {
            return;
        }

        this.running = true;
        this.lastTime = performance.now();
        this.accumulated = 0;
        this.rafId = requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Stops the game loop
     */
    public stop(): void {
        if (!this.running) {
            return;
        }

        this.running = false;
        cancelAnimationFrame(this.rafId);
    }

    /**
     * Returns current game loop statistics
     */
    public getStats(): GameLoopStats {
        return { ...this.stats };
    }

    /**
     * Main loop function
     * @private
     */
    private loop(currentTime: number): void {
        if (!this.running) {
            return;
        }

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Prevent spiral of death
        if (deltaTime > 1000) {
            deltaTime = this.frameTime;
        }

        this.accumulated += deltaTime;
        let updates = 0;

        // Update game logic at fixed timestep
        while (this.accumulated >= this.frameTime) {
            try {
                this.callbacks.update(this.frameTime);
                this.accumulated -= this.frameTime;
                updates++;
                this.stats.updates++;

                // Check for update spiral
                if (updates >= this.maxUpdatesPerFrame) {
                    this.handlePanic();
                    break;
                }
            } catch (error) {
                console.error('Error in update callback:', error);
                this.stop();
                throw error;
            }
        }

        // Calculate interpolation for smooth rendering
        const interpolation = this.accumulated / this.frameTime;

        // Render frame
        try {
            this.callbacks.render(interpolation);
            this.stats.renders++;
        } catch (error) {
            console.error('Error in render callback:', error);
            this.stop();
            throw error;
        }

        // Update stats
        this.stats.frameTime = deltaTime;

        // Queue next frame
        this.rafId = requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Handles panic mode when updates are taking too long
     * @private
     */
    private handlePanic(): void {
        this.accumulated = 0;
        if (this.callbacks.onPanic) {
            this.callbacks.onPanic();
        }
    }

    /**
     * Validates callback functions
     * @private
     */
    private validateCallbacks(callbacks: GameLoopCallbacks): void {
        if (typeof callbacks.update !== 'function') {
            throw new Error('Update callback must be a function');
        }
        if (typeof callbacks.render !== 'function') {
            throw new Error('Render callback must be a function');
        }
    }

    /**
     * Initializes FPS tracking
     * @private
     */
    private initializeStatsTracking(): void {
        this.statsInterval = window.setInterval(() => {
            this.stats.fps = this.stats.renders;
            this.stats.renders = 0;
            this.stats.updates = 0;
        }, 1000);
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        this.stop();
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
    }
}