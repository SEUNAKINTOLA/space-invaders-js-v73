/**
 * @file Time.ts
 * @module Time
 * @description Provides time management utilities for game loop implementation with
 * fixed timestep updates. Handles delta time calculations, frame timing, and FPS monitoring.
 */

/**
 * Configuration constants for time management
 */
const TIME_CONFIG = {
    /** Default fixed timestep in seconds */
    DEFAULT_FIXED_TIMESTEP: 1 / 60,
    /** Maximum delta time to prevent spiral of death */
    MAX_DELTA_TIME: 0.25,
    /** Minimum FPS before triggering slow-motion warning */
    MIN_FPS_THRESHOLD: 30,
} as const;

/**
 * Represents the current time state of the game loop
 */
export interface TimeState {
    /** Total elapsed time since game start (in seconds) */
    readonly totalTime: number;
    /** Time elapsed since last frame (in seconds) */
    readonly deltaTime: number;
    /** Fixed timestep duration (in seconds) */
    readonly fixedTimestep: number;
    /** Current frames per second */
    readonly fps: number;
}

/**
 * Manages time-related functionality for the game loop
 */
export class Time {
    private startTime: number;
    private lastFrameTime: number;
    private deltaTime: number;
    private fixedTimestep: number;
    private accumulator: number;
    private frameCount: number;
    private fpsUpdateTime: number;
    private currentFps: number;

    /**
     * Creates a new Time instance
     * @param fixedTimestep - Optional custom fixed timestep duration (in seconds)
     */
    constructor(fixedTimestep: number = TIME_CONFIG.DEFAULT_FIXED_TIMESTEP) {
        this.validateFixedTimestep(fixedTimestep);
        
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.deltaTime = 0;
        this.fixedTimestep = fixedTimestep;
        this.accumulator = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = this.startTime;
        this.currentFps = 0;
    }

    /**
     * Updates time calculations for the current frame
     * @returns Current time state
     */
    public update(): TimeState {
        const currentTime = performance.now();
        this.deltaTime = Math.min(
            (currentTime - this.lastFrameTime) / 1000,
            TIME_CONFIG.MAX_DELTA_TIME
        );
        this.lastFrameTime = currentTime;
        this.accumulator += this.deltaTime;

        // Update FPS calculation
        this.frameCount++;
        const timeSinceLastFpsUpdate = currentTime - this.fpsUpdateTime;
        if (timeSinceLastFpsUpdate >= 1000) { // Update FPS every second
            this.currentFps = (this.frameCount * 1000) / timeSinceLastFpsUpdate;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            this.checkPerformance();
        }

        return this.getTimeState();
    }

    /**
     * Checks if a fixed update step should occur
     * @returns True if fixed update should occur
     */
    public shouldFixedUpdate(): boolean {
        if (this.accumulator >= this.fixedTimestep) {
            this.accumulator -= this.fixedTimestep;
            return true;
        }
        return false;
    }

    /**
     * Gets the current interpolation alpha for smooth rendering
     * @returns Interpolation alpha value between 0 and 1
     */
    public getInterpolationAlpha(): number {
        return this.accumulator / this.fixedTimestep;
    }

    /**
     * Gets the current time state
     * @returns Current TimeState object
     */
    public getTimeState(): TimeState {
        return {
            totalTime: (performance.now() - this.startTime) / 1000,
            deltaTime: this.deltaTime,
            fixedTimestep: this.fixedTimestep,
            fps: this.currentFps
        };
    }

    /**
     * Resets the time system
     */
    public reset(): void {
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.deltaTime = 0;
        this.accumulator = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = this.startTime;
        this.currentFps = 0;
    }

    /**
     * Validates the fixed timestep value
     * @param timestep - Fixed timestep value to validate
     * @throws Error if timestep is invalid
     */
    private validateFixedTimestep(timestep: number): void {
        if (timestep <= 0 || !Number.isFinite(timestep)) {
            throw new Error('Fixed timestep must be a positive finite number');
        }
    }

    /**
     * Checks performance and logs warnings if FPS is too low
     */
    private checkPerformance(): void {
        if (this.currentFps < TIME_CONFIG.MIN_FPS_THRESHOLD) {
            console.warn(
                `Low FPS detected: ${Math.round(this.currentFps)} FPS. ` +
                'Consider optimizing performance.'
            );
        }
    }
}

/**
 * Creates a Time instance with default configuration
 * @returns Configured Time instance
 */
export function createTime(fixedTimestep?: number): Time {
    return new Time(fixedTimestep);
}