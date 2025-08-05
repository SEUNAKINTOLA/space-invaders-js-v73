/**
 * @file DifficultyConfig.ts
 * @description Configuration for game difficulty scaling system.
 * Manages difficulty progression parameters and calculations.
 * 
 * @module DifficultyConfig
 * @version 1.0.0
 */

// =========================================================
// Types & Interfaces
// =========================================================

/**
 * Represents difficulty level parameters
 */
export interface DifficultyParameters {
    enemySpeed: number;
    enemyHealth: number;
    enemyDamage: number;
    spawnRate: number;
    scoreMultiplier: number;
}

/**
 * Represents a difficulty curve configuration
 */
export interface DifficultyCurve {
    baseValue: number;
    scalingFactor: number;
    maxValue: number;
    minValue: number;
}

// =========================================================
// Constants
// =========================================================

/**
 * Base difficulty levels configuration
 */
export const DIFFICULTY_PRESETS = {
    EASY: {
        enemySpeed: 1.0,
        enemyHealth: 100,
        enemyDamage: 10,
        spawnRate: 1.0,
        scoreMultiplier: 1.0
    },
    NORMAL: {
        enemySpeed: 1.2,
        enemyHealth: 150,
        enemyDamage: 15,
        spawnRate: 1.2,
        scoreMultiplier: 1.5
    },
    HARD: {
        enemySpeed: 1.5,
        enemyHealth: 200,
        enemyDamage: 20,
        spawnRate: 1.5,
        scoreMultiplier: 2.0
    }
} as const;

/**
 * Scaling curves for different parameters
 */
export const SCALING_CURVES: Record<keyof DifficultyParameters, DifficultyCurve> = {
    enemySpeed: {
        baseValue: 1.0,
        scalingFactor: 0.1,
        maxValue: 2.5,
        minValue: 0.5
    },
    enemyHealth: {
        baseValue: 100,
        scalingFactor: 0.15,
        maxValue: 500,
        minValue: 50
    },
    enemyDamage: {
        baseValue: 10,
        scalingFactor: 0.12,
        maxValue: 50,
        minValue: 5
    },
    spawnRate: {
        baseValue: 1.0,
        scalingFactor: 0.08,
        maxValue: 3.0,
        minValue: 0.5
    },
    scoreMultiplier: {
        baseValue: 1.0,
        scalingFactor: 0.05,
        maxValue: 5.0,
        minValue: 1.0
    }
};

// =========================================================
// Difficulty Calculator Class
// =========================================================

export class DifficultyCalculator {
    private currentLevel: number;
    private basePreset: DifficultyParameters;

    /**
     * Creates a new DifficultyCalculator instance
     * @param initialLevel - Starting difficulty level
     * @param preset - Base difficulty preset to use
     */
    constructor(
        initialLevel: number = 1,
        preset: keyof typeof DIFFICULTY_PRESETS = 'NORMAL'
    ) {
        this.currentLevel = Math.max(1, initialLevel);
        this.basePreset = DIFFICULTY_PRESETS[preset];
    }

    /**
     * Calculates scaled value based on difficulty curve
     * @param baseValue - Starting value
     * @param curve - Difficulty scaling curve
     * @returns Scaled value
     */
    private calculateScaledValue(baseValue: number, curve: DifficultyCurve): number {
        const scaledValue = baseValue * (1 + (this.currentLevel - 1) * curve.scalingFactor);
        return Math.min(Math.max(scaledValue, curve.minValue), curve.maxValue);
    }

    /**
     * Gets current difficulty parameters based on level
     * @returns Current difficulty parameters
     */
    public getCurrentParameters(): DifficultyParameters {
        return {
            enemySpeed: this.calculateScaledValue(
                this.basePreset.enemySpeed,
                SCALING_CURVES.enemySpeed
            ),
            enemyHealth: this.calculateScaledValue(
                this.basePreset.enemyHealth,
                SCALING_CURVES.enemyHealth
            ),
            enemyDamage: this.calculateScaledValue(
                this.basePreset.enemyDamage,
                SCALING_CURVES.enemyDamage
            ),
            spawnRate: this.calculateScaledValue(
                this.basePreset.spawnRate,
                SCALING_CURVES.spawnRate
            ),
            scoreMultiplier: this.calculateScaledValue(
                this.basePreset.scoreMultiplier,
                SCALING_CURVES.scoreMultiplier
            )
        };
    }

    /**
     * Increases the difficulty level
     * @param levels - Number of levels to increase (default: 1)
     */
    public increaseDifficulty(levels: number = 1): void {
        if (levels < 0) {
            throw new Error('Cannot increase difficulty by negative levels');
        }
        this.currentLevel += levels;
    }

    /**
     * Gets the current difficulty level
     * @returns Current level
     */
    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    /**
     * Resets difficulty to initial state
     * @param level - Level to reset to (default: 1)
     */
    public reset(level: number = 1): void {
        this.currentLevel = Math.max(1, level);
    }
}

export default DifficultyCalculator;