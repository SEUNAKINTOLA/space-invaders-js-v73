/**
 * @file AudioManager.ts
 * @description Core audio system manager for handling sound effects and audio playback
 * Implements the Singleton pattern to ensure a single point of audio control
 */

// Types and interfaces
interface AudioConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  enabled: boolean;
}

interface AudioTrack {
  id: string;
  path: string;
  loop: boolean;
  volume: number;
  category: 'sfx' | 'music';
}

type AudioLoadCallback = (success: boolean) => void;

/**
 * Manages all audio operations including loading, playing, and controlling sound effects and music
 */
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeAudioSources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();

  private config: AudioConfig = {
    masterVolume: 1.0,
    sfxVolume: 1.0,
    musicVolume: 1.0,
    enabled: true,
  };

  private constructor() {
    this.initializeAudioContext();
  }

  /**
   * Gets the singleton instance of AudioManager
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initializes the Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Web Audio API is not supported in this browser:', error);
    }
  }

  /**
   * Loads an audio file and stores it in the buffer
   * @param track Audio track information
   * @param callback Callback function after loading completes
   */
  public async loadAudio(track: AudioTrack, callback?: AudioLoadCallback): Promise<void> {
    if (!this.audioContext) {
      callback?.(false);
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(track.path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(track.id, audioBuffer);
      callback?.(true);
    } catch (error) {
      console.error(`Error loading audio ${track.id}:`, error);
      callback?.(false);
      throw new Error(`Failed to load audio: ${track.id}`);
    }
  }

  /**
   * Plays an audio track
   * @param trackId ID of the track to play
   * @param options Optional playback options
   */
  public play(trackId: string, options: Partial<AudioTrack> = {}): void {
    if (!this.audioContext || !this.config.enabled) return;

    const buffer = this.audioBuffers.get(trackId);
    if (!buffer) {
      throw new Error(`Audio buffer not found for track: ${trackId}`);
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.loop = options.loop ?? false;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume based on category and master volume
      const category = options.category ?? 'sfx';
      const categoryVolume = category === 'sfx' ? this.config.sfxVolume : this.config.musicVolume;
      gainNode.gain.value = this.config.masterVolume * categoryVolume * (options.volume ?? 1.0);

      source.start(0);

      // Store references for later control
      this.activeAudioSources.set(trackId, source);
      this.gainNodes.set(trackId, gainNode);

      // Clean up when playback ends
      source.onended = () => {
        this.activeAudioSources.delete(trackId);
        this.gainNodes.delete(trackId);
      };
    } catch (error) {
      console.error(`Error playing audio ${trackId}:`, error);
      throw new Error(`Failed to play audio: ${trackId}`);
    }
  }

  /**
   * Stops playback of a specific track
   * @param trackId ID of the track to stop
   */
  public stop(trackId: string): void {
    const source = this.activeAudioSources.get(trackId);
    if (source) {
      source.stop();
      this.activeAudioSources.delete(trackId);
      this.gainNodes.delete(trackId);
    }
  }

  /**
   * Updates the audio system configuration
   * @param config Partial configuration to update
   */
  public updateConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateAllGainNodes();
  }

  /**
   * Updates gain values for all active audio sources
   */
  private updateAllGainNodes(): void {
    this.gainNodes.forEach((gainNode, trackId) => {
      const source = this.activeAudioSources.get(trackId);
      if (source && gainNode) {
        const category = source.loop ? 'music' : 'sfx';
        const categoryVolume = category === 'sfx' ? this.config.sfxVolume : this.config.musicVolume;
        gainNode.gain.value = this.config.masterVolume * categoryVolume;
      }
    });
  }

  /**
   * Releases all audio resources
   */
  public dispose(): void {
    this.activeAudioSources.forEach(source => source.stop());
    this.activeAudioSources.clear();
    this.gainNodes.clear();
    this.audioBuffers.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export a default instance
export default AudioManager.getInstance();