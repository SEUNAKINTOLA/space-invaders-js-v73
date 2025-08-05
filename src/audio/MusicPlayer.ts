/**
 * @file MusicPlayer.ts
 * @description Background music system with cross-fading capability
 * 
 * This module provides a robust background music player that supports:
 * - Smooth transitions between tracks
 * - Volume control
 * - Fade in/out effects
 * - Multiple audio format support
 * - Error handling and recovery
 */

// Constants for audio configuration
const DEFAULT_FADE_DURATION = 2000; // milliseconds
const DEFAULT_VOLUME = 0.8;
const VOLUME_STEP = 0.01;
const FADE_INTERVAL = 50; // milliseconds

/**
 * Represents the state of a music track
 */
interface TrackState {
  audio: HTMLAudioElement;
  volume: number;
  isPlaying: boolean;
}

/**
 * Configuration options for the MusicPlayer
 */
interface MusicPlayerConfig {
  fadeDuration?: number;
  defaultVolume?: number;
  autoPlay?: boolean;
}

/**
 * Manages background music playback with cross-fading capability
 */
export class MusicPlayer {
  private currentTrack: TrackState | null = null;
  private nextTrack: TrackState | null = null;
  private fadeDuration: number;
  private defaultVolume: number;
  private autoPlay: boolean;

  /**
   * Creates a new MusicPlayer instance
   * @param config Configuration options for the music player
   */
  constructor(config: MusicPlayerConfig = {}) {
    this.fadeDuration = config.fadeDuration || DEFAULT_FADE_DURATION;
    this.defaultVolume = config.defaultVolume || DEFAULT_VOLUME;
    this.autoPlay = config.autoPlay || false;
  }

  /**
   * Loads and plays a music track with optional cross-fade
   * @param url URL of the audio file to play
   * @param crossFade Whether to cross-fade with the current track
   * @throws Error if the audio file cannot be loaded
   */
  public async playTrack(url: string, crossFade: boolean = true): Promise<void> {
    try {
      const audio = new Audio(url);
      await this.loadAudio(audio);

      const newTrack: TrackState = {
        audio,
        volume: 0,
        isPlaying: false,
      };

      if (this.currentTrack && crossFade) {
        this.nextTrack = newTrack;
        await this.crossFade();
      } else {
        if (this.currentTrack) {
          await this.stopTrack(this.currentTrack);
        }
        this.currentTrack = newTrack;
        await this.startTrack(this.currentTrack);
      }
    } catch (error) {
      throw new Error(`Failed to play track: ${error.message}`);
    }
  }

  /**
   * Stops all currently playing music
   */
  public async stop(): Promise<void> {
    if (this.currentTrack) {
      await this.fadeOut(this.currentTrack);
      this.stopTrack(this.currentTrack);
      this.currentTrack = null;
    }
    if (this.nextTrack) {
      this.stopTrack(this.nextTrack);
      this.nextTrack = null;
    }
  }

  /**
   * Sets the master volume for all playing tracks
   * @param volume Volume level (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (this.currentTrack) {
      this.currentTrack.audio.volume = clampedVolume;
      this.currentTrack.volume = clampedVolume;
    }
  }

  /**
   * Loads an audio element and ensures it's ready to play
   * @param audio Audio element to load
   */
  private loadAudio(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', (e) => reject(e), { once: true });
      audio.load();
    });
  }

  /**
   * Performs cross-fade between current and next track
   */
  private async crossFade(): Promise<void> {
    if (!this.currentTrack || !this.nextTrack) return;

    await Promise.all([
      this.fadeOut(this.currentTrack),
      this.fadeIn(this.nextTrack)
    ]);

    this.stopTrack(this.currentTrack);
    this.currentTrack = this.nextTrack;
    this.nextTrack = null;
  }

  /**
   * Fades in a track
   * @param track Track to fade in
   */
  private fadeIn(track: TrackState): Promise<void> {
    return new Promise((resolve) => {
      track.audio.volume = 0;
      track.audio.play();
      track.isPlaying = true;

      let volume = 0;
      const interval = setInterval(() => {
        volume = Math.min(volume + VOLUME_STEP, this.defaultVolume);
        track.audio.volume = volume;
        track.volume = volume;

        if (volume >= this.defaultVolume) {
          clearInterval(interval);
          resolve();
        }
      }, FADE_INTERVAL);
    });
  }

  /**
   * Fades out a track
   * @param track Track to fade out
   */
  private fadeOut(track: TrackState): Promise<void> {
    return new Promise((resolve) => {
      let volume = track.volume;
      const interval = setInterval(() => {
        volume = Math.max(volume - VOLUME_STEP, 0);
        track.audio.volume = volume;
        track.volume = volume;

        if (volume <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, FADE_INTERVAL);
    });
  }

  /**
   * Starts playing a track
   * @param track Track to start
   */
  private async startTrack(track: TrackState): Promise<void> {
    track.audio.volume = this.defaultVolume;
    track.volume = this.defaultVolume;
    await track.audio.play();
    track.isPlaying = true;
  }

  /**
   * Stops a track
   * @param track Track to stop
   */
  private stopTrack(track: TrackState): void {
    track.audio.pause();
    track.audio.currentTime = 0;
    track.isPlaying = false;
  }
}