/**
 * @file WaveManager.ts
 * @description Manages enemy wave spawning and progression system for the game
 * Handles wave timing, difficulty scaling, and spawn coordination
 */

// Types and Interfaces
interface WaveConfig {
  initialEnemyCount: number;
  enemyCountIncrement: number;
  timeBetweenWaves: number;
  difficultyScaling: number;
}

interface EnemySpawnData {
  type: string;
  count: number;
  spawnDelay: number;
}

interface WaveData {
  waveNumber: number;
  enemies: EnemySpawnData[];
  difficulty: number;
}

/**
 * Default configuration for wave management
 */
const DEFAULT_WAVE_CONFIG: WaveConfig = {
  initialEnemyCount: 5,
  enemyCountIncrement: 2,
  timeBetweenWaves: 10000, // 10 seconds
  difficultyScaling: 1.2
};

/**
 * Manages the spawning and progression of enemy waves
 */
export class WaveManager {
  private currentWave: number;
  private isWaveActive: boolean;
  private config: WaveConfig;
  private waveTimeout: NodeJS.Timeout | null;
  private onWaveComplete?: () => void;
  private onEnemySpawn?: (enemyType: string) => void;

  /**
   * Creates a new WaveManager instance
   * @param config Optional configuration to override defaults
   */
  constructor(config?: Partial<WaveConfig>) {
    this.currentWave = 0;
    this.isWaveActive = false;
    this.config = { ...DEFAULT_WAVE_CONFIG, ...config };
    this.waveTimeout = null;
  }

  /**
   * Starts the wave system
   * @throws Error if system is already running
   */
  public start(): void {
    if (this.isWaveActive) {
      throw new Error('Wave system is already running');
    }

    this.isWaveActive = true;
    this.startNextWave();
  }

  /**
   * Stops the wave system and cleans up resources
   */
  public stop(): void {
    this.isWaveActive = false;
    if (this.waveTimeout) {
      clearTimeout(this.waveTimeout);
      this.waveTimeout = null;
    }
  }

  /**
   * Sets up callback for wave completion
   * @param callback Function to call when wave completes
   */
  public onWaveCompleted(callback: () => void): void {
    this.onWaveComplete = callback;
  }

  /**
   * Sets up callback for enemy spawning
   * @param callback Function to call when enemy spawns
   */
  public onEnemySpawned(callback: (enemyType: string) => void): void {
    this.onEnemySpawn = callback;
  }

  /**
   * Gets the current wave number
   * @returns Current wave number
   */
  public getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Generates data for the next wave
   * @returns Wave data including enemy types and counts
   */
  private generateWaveData(): WaveData {
    const waveNumber = this.currentWave + 1;
    const difficulty = Math.pow(this.config.difficultyScaling, waveNumber - 1);
    const baseEnemyCount = this.config.initialEnemyCount + 
      (this.config.enemyCountIncrement * (waveNumber - 1));

    // Generate enemy distribution for the wave
    const enemies: EnemySpawnData[] = this.calculateEnemyDistribution(
      baseEnemyCount,
      difficulty
    );

    return {
      waveNumber,
      enemies,
      difficulty
    };
  }

  /**
   * Calculates enemy distribution for a wave
   * @param totalEnemies Total number of enemies to spawn
   * @param difficulty Current difficulty multiplier
   * @returns Array of enemy spawn data
   */
  private calculateEnemyDistribution(
    totalEnemies: number,
    difficulty: number
  ): EnemySpawnData[] {
    // Example enemy distribution logic
    const distribution: EnemySpawnData[] = [
      {
        type: 'basic',
        count: Math.floor(totalEnemies * 0.6),
        spawnDelay: 1000
      },
      {
        type: 'fast',
        count: Math.floor(totalEnemies * 0.3),
        spawnDelay: 1500
      },
      {
        type: 'tough',
        count: Math.floor(totalEnemies * 0.1),
        spawnDelay: 2000
      }
    ];

    return distribution;
  }

  /**
   * Starts the next wave of enemies
   */
  private startNextWave(): void {
    if (!this.isWaveActive) return;

    this.currentWave++;
    const waveData = this.generateWaveData();

    // Spawn enemies according to wave data
    this.spawnWaveEnemies(waveData);

    // Schedule next wave
    this.scheduleNextWave();
  }

  /**
   * Handles the spawning of enemies for a wave
   * @param waveData Data for the current wave
   */
  private spawnWaveEnemies(waveData: WaveData): void {
    waveData.enemies.forEach(enemyData => {
      for (let i = 0; i < enemyData.count; i++) {
        setTimeout(() => {
          if (!this.isWaveActive) return;
          
          if (this.onEnemySpawn) {
            this.onEnemySpawn(enemyData.type);
          }
        }, enemyData.spawnDelay * i);
      }
    });

    // Calculate total wave duration
    const maxSpawnDelay = Math.max(
      ...waveData.enemies.map(e => e.spawnDelay * e.count)
    );

    // Trigger wave completion after all enemies have spawned
    setTimeout(() => {
      if (this.onWaveComplete) {
        this.onWaveComplete();
      }
    }, maxSpawnDelay);
  }

  /**
   * Schedules the next wave
   */
  private scheduleNextWave(): void {
    if (!this.isWaveActive) return;

    this.waveTimeout = setTimeout(
      () => this.startNextWave(),
      this.config.timeBetweenWaves
    );
  }
}