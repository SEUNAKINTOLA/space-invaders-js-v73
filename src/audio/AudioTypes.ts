/**
 * @file AudioTypes.ts
 * @description Type definitions for the audio system foundation.
 * Contains interfaces and types for managing and playing sound effects.
 * 
 * @module AudioTypes
 * @version 1.0.0
 */

// =========================================================
// Enums
// =========================================================

/**
 * Represents the current state of an audio instance
 */
export enum AudioState {
  UNLOADED = 'UNLOADED',
  LOADING = 'LOADING',
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR'
}

/**
 * Supported audio file formats
 */
export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
  AAC = 'aac'
}

// =========================================================
// Interfaces
// =========================================================

/**
 * Configuration options for audio playback
 */
export interface AudioConfig {
  /** Volume level from 0 to 1 */
  volume: number;
  /** Playback rate (1 = normal speed) */
  playbackRate: number;
  /** Whether the audio should loop */
  loop: boolean;
  /** Whether the audio should start playing automatically */
  autoplay: boolean;
  /** Audio file format */
  format: AudioFormat;
}

/**
 * Represents an audio resource with its metadata
 */
export interface AudioResource {
  /** Unique identifier for the audio resource */
  id: string;
  /** Display name of the audio resource */
  name: string;
  /** Path to the audio file */
  path: string;
  /** Current state of the audio resource */
  state: AudioState;
  /** Configuration for this audio resource */
  config: AudioConfig;
  /** Duration in seconds */
  duration?: number;
  /** Size in bytes */
  size?: number;
}

/**
 * Error information for audio operations
 */
export interface AudioError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Original error object if available */
  originalError?: Error;
  /** Additional error context */
  context?: Record<string, unknown>;
}

/**
 * Events that can be emitted by the audio system
 */
export interface AudioEvents {
  /** Fired when audio loading starts */
  onLoadStart: () => void;
  /** Fired when audio is loaded successfully */
  onLoad: () => void;
  /** Fired when audio loading fails */
  onLoadError: (error: AudioError) => void;
  /** Fired when audio playback starts */
  onPlay: () => void;
  /** Fired when audio playback pauses */
  onPause: () => void;
  /** Fired when audio playback stops */
  onStop: () => void;
  /** Fired when audio playback ends */
  onEnd: () => void;
  /** Fired when audio state changes */
  onStateChange: (newState: AudioState) => void;
}

/**
 * Statistics for audio system monitoring
 */
export interface AudioStats {
  /** Total number of loaded audio resources */
  totalLoaded: number;
  /** Total memory usage in bytes */
  memoryUsage: number;
  /** Number of currently playing sounds */
  activeSounds: number;
  /** System status information */
  systemInfo: {
    /** Whether audio is supported */
    supported: boolean;
    /** Whether audio context is running */
    contextRunning: boolean;
    /** Sample rate of audio context */
    sampleRate: number;
  };
}

// =========================================================
// Type Aliases
// =========================================================

/**
 * Unique identifier for audio resources
 */
export type AudioId = string;

/**
 * Valid volume range from 0 to 1
 */
export type VolumeLevel = number;

/**
 * Callback for audio operations
 */
export type AudioCallback = (error: AudioError | null, result?: any) => void;

// =========================================================
// Default Values
// =========================================================

/**
 * Default configuration for audio playback
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  volume: 1.0,
  playbackRate: 1.0,
  loop: false,
  autoplay: false,
  format: AudioFormat.MP3
};

/**
 * Maximum number of concurrent audio playbacks
 */
export const MAX_CONCURRENT_PLAYBACK = 32;

/**
 * Default fade duration in milliseconds
 */
export const DEFAULT_FADE_DURATION = 500;