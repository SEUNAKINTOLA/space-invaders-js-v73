/**
 * @file GameStates.ts
 * @description Manages game states and state transitions using the State pattern.
 * Provides a type-safe implementation for handling different game states.
 */

// =========================================
// Types and Interfaces
// =========================================

/**
 * Represents the possible states a game can be in
 */
export enum GameStateType {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

/**
 * Interface that all game states must implement
 */
export interface IGameState {
  enter(): void;
  exit(): void;
  update(deltaTime: number): void;
  render(): void;
}

/**
 * Interface for objects that can be observed for state changes
 */
export interface IGameStateObserver {
  onStateChanged(newState: GameStateType, oldState: GameStateType): void;
}

// =========================================
// State Implementation
// =========================================

/**
 * Abstract base class for all game states
 */
export abstract class BaseGameState implements IGameState {
  protected context: GameStateManager;

  constructor(context: GameStateManager) {
    this.context = context;
  }

  abstract enter(): void;
  abstract exit(): void;
  abstract update(deltaTime: number): void;
  abstract render(): void;
}

/**
 * Concrete state implementations
 */
export class LoadingState extends BaseGameState {
  enter(): void {
    console.log('Entering Loading State');
  }

  exit(): void {
    console.log('Exiting Loading State');
  }

  update(deltaTime: number): void {
    // Loading state update logic
  }

  render(): void {
    // Loading state render logic
  }
}

// Similar implementations for other states...
export class MenuState extends BaseGameState {
  // Implementation
}

export class PlayingState extends BaseGameState {
  // Implementation
}

export class PausedState extends BaseGameState {
  // Implementation
}

export class GameOverState extends BaseGameState {
  // Implementation
}

// =========================================
// State Manager
// =========================================

/**
 * Manages game states and transitions between them
 */
export class GameStateManager {
  private currentState: IGameState | null = null;
  private states: Map<GameStateType, IGameState>;
  private observers: Set<IGameStateObserver>;
  private currentStateType: GameStateType | null = null;

  constructor() {
    this.states = new Map();
    this.observers = new Set();
    this.initializeStates();
  }

  /**
   * Initializes all possible game states
   * @private
   */
  private initializeStates(): void {
    this.states.set(GameStateType.LOADING, new LoadingState(this));
    this.states.set(GameStateType.MENU, new MenuState(this));
    this.states.set(GameStateType.PLAYING, new PlayingState(this));
    this.states.set(GameStateType.PAUSED, new PausedState(this));
    this.states.set(GameStateType.GAME_OVER, new GameOverState(this));
  }

  /**
   * Changes the current game state
   * @param newState - The state to transition to
   * @throws Error if the state is not found
   */
  public changeState(newState: GameStateType): void {
    const nextState = this.states.get(newState);
    
    if (!nextState) {
      throw new Error(`State ${newState} not found`);
    }

    // Exit current state
    if (this.currentState) {
      this.currentState.exit();
    }

    // Update state
    const oldState = this.currentStateType;
    this.currentState = nextState;
    this.currentStateType = newState;

    // Enter new state
    this.currentState.enter();

    // Notify observers
    if (oldState) {
      this.notifyObservers(newState, oldState);
    }
  }

  /**
   * Updates the current state
   * @param deltaTime - Time elapsed since last update
   */
  public update(deltaTime: number): void {
    if (this.currentState) {
      this.currentState.update(deltaTime);
    }
  }

  /**
   * Renders the current state
   */
  public render(): void {
    if (this.currentState) {
      this.currentState.render();
    }
  }

  /**
   * Adds an observer to state changes
   * @param observer - The observer to add
   */
  public addObserver(observer: IGameStateObserver): void {
    this.observers.add(observer);
  }

  /**
   * Removes an observer
   * @param observer - The observer to remove
   */
  public removeObserver(observer: IGameStateObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Notifies all observers of a state change
   * @private
   */
  private notifyObservers(newState: GameStateType, oldState: GameStateType): void {
    this.observers.forEach(observer => {
      observer.onStateChanged(newState, oldState);
    });
  }

  /**
   * Gets the current state type
   * @returns The current state type or null if no state is set
   */
  public getCurrentStateType(): GameStateType | null {
    return this.currentStateType;
  }
}

// =========================================
// Error Types
// =========================================

export class GameStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameStateError';
  }
}