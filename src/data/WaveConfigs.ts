/**
 * @file WaveConfigs.ts
 * @description Configuration file for enemy wave management system.
 * Defines wave patterns, enemy types, and spawn configurations.
 */

// =========================================================
// Types & Interfaces
// =========================================================

/**
 * Represents the possible enemy types in the game
 */
export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  TANK = 'TANK',
  BOSS = 'BOSS',
}

/**
 * Defines the properties for a single enemy within a wave
 */
export interface EnemyConfig {
  type: EnemyType;
  health: number;
  speed: number;
  damage: number;
  points: number;
  spawnDelay: number; // Delay in milliseconds before spawning this enemy
}

/**
 * Defines the structure for a single wave of enemies
 */
export interface WaveConfig {
  waveId: number;
  enemies: EnemyConfig[];
  timeBetweenEnemies: number; // Milliseconds between enemy spawns
  bonusPoints: number;
  difficulty: number;
}

// =========================================================
// Constants & Default Values
// =========================================================

/**
 * Base stats for different enemy types
 */
export const BASE_ENEMY_STATS: Record<EnemyType, Omit<EnemyConfig, 'spawnDelay'>> = {
  [EnemyType.BASIC]: {
    type: EnemyType.BASIC,
    health: 100,
    speed: 1,
    damage: 10,
    points: 100,
  },
  [EnemyType.FAST]: {
    type: EnemyType.FAST,
    health: 50,
    speed: 2,
    damage: 5,
    points: 150,
  },
  [EnemyType.TANK]: {
    type: EnemyType.TANK,
    health: 200,
    speed: 0.5,
    damage: 20,
    points: 200,
  },
  [EnemyType.BOSS]: {
    type: EnemyType.BOSS,
    health: 1000,
    speed: 0.3,
    damage: 50,
    points: 1000,
  },
};

/**
 * Wave configuration for the entire game
 */
export const WAVE_CONFIGS: WaveConfig[] = [
  {
    waveId: 1,
    enemies: [
      { ...BASE_ENEMY_STATS[EnemyType.BASIC], spawnDelay: 0 },
      { ...BASE_ENEMY_STATS[EnemyType.BASIC], spawnDelay: 1000 },
      { ...BASE_ENEMY_STATS[EnemyType.BASIC], spawnDelay: 2000 },
    ],
    timeBetweenEnemies: 2000,
    bonusPoints: 500,
    difficulty: 1,
  },
  {
    waveId: 2,
    enemies: [
      { ...BASE_ENEMY_STATS[EnemyType.BASIC], spawnDelay: 0 },
      { ...BASE_ENEMY_STATS[EnemyType.FAST], spawnDelay: 1000 },
      { ...BASE_ENEMY_STATS[EnemyType.BASIC], spawnDelay: 2000 },
      { ...BASE_ENEMY_STATS[EnemyType.FAST], spawnDelay: 3000 },
    ],
    timeBetweenEnemies: 1500,
    bonusPoints: 1000,
    difficulty: 2,
  },
  // Add more waves as needed...
];

// =========================================================
// Helper Functions
// =========================================================

/**
 * Retrieves a wave configuration by its ID
 * @param waveId The ID of the wave to retrieve
 * @returns The wave configuration or undefined if not found
 */
export function getWaveConfig(waveId: number): WaveConfig | undefined {
  return WAVE_CONFIGS.find(wave => wave.waveId === waveId);
}

/**
 * Calculates the total duration of a wave in milliseconds
 * @param wave The wave configuration to calculate duration for
 * @returns The total duration in milliseconds
 */
export function calculateWaveDuration(wave: WaveConfig): number {
  if (!wave.enemies.length) return 0;
  
  const lastEnemy = wave.enemies[wave.enemies.length - 1];
  return lastEnemy.spawnDelay + wave.timeBetweenEnemies;
}

/**
 * Scales enemy stats based on difficulty
 * @param enemy The base enemy configuration
 * @param difficulty The difficulty multiplier
 * @returns Scaled enemy configuration
 */
export function scaleEnemyStats(enemy: EnemyConfig, difficulty: number): EnemyConfig {
  return {
    ...enemy,
    health: Math.round(enemy.health * difficulty),
    damage: Math.round(enemy.damage * difficulty),
    points: Math.round(enemy.points * difficulty),
  };
}

// =========================================================
// Validation
// =========================================================

/**
 * Validates a wave configuration
 * @param wave The wave configuration to validate
 * @throws Error if the configuration is invalid
 */
export function validateWaveConfig(wave: WaveConfig): void {
  if (!wave.waveId || wave.waveId < 1) {
    throw new Error('Invalid wave ID');
  }
  
  if (!wave.enemies || wave.enemies.length === 0) {
    throw new Error('Wave must contain at least one enemy');
  }
  
  if (wave.timeBetweenEnemies < 0) {
    throw new Error('Time between enemies must be non-negative');
  }
  
  wave.enemies.forEach((enemy, index) => {
    if (enemy.health <= 0 || enemy.damage < 0 || enemy.speed <= 0) {
      throw new Error(`Invalid enemy stats in wave ${wave.waveId}, enemy index ${index}`);
    }
  });
}

// Validate all wave configs at startup
WAVE_CONFIGS.forEach(validateWaveConfig);