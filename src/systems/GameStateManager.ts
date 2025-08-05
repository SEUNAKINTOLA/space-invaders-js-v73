/**
 * @file GameStateManager.ts
 * @description Manages game states and transitions between different states in the game.
 * Implements a type-safe state management system using the State pattern.
 */

// =========================================
// Types and Interfaces
// =========================================

/**
 * Represents the possible states of the game
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
 * Type for state transition map
 */
type StateTransitions = {
  [key in GameStateType]?: Set<GameStateType>;
};

// =========================================
// Game State Manager Implementation
// =========================================

export class GameStateManager {
  private static instance: GameStateManager;
  private currentState: IGameState | null = null;
  private states: Map<GameStateType, IGameState> = new Map();
  private currentStateType: GameStateType | null = null;
  private allowedTransitions: StateTransitions = {};

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.initializeTransitions();
  }

  /**
   * Gets the singleton instance of GameStateManager
   */
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Initializes the allowed state transitions
   */
  private initializeTransitions(): void {
    this.allowedTransitions = {
      [GameStateType.LOADING]: new Set([GameStateType.MENU]),
      [GameStateType.MENU]: new Set([GameStateType.PLAYING, GameStateType.LOADING]),
      [GameStateType.PLAYING]: new Set([GameStateType.PAUSED, GameStateType.GAME_OVER]),
      [GameStateType.PAUSED]: new Set([GameStateType.PLAYING, GameStateType.MENU]),
      [GameStateType.GAME_OVER]: new Set([GameStateType.MENU, GameStateType.PLAYING])
    };
  }

  /**
   * Registers a new state with the manager
   * @param stateType - The type of state to register
   * @param state - The state implementation
   * @throws Error if state type is already registered
   */
  public registerState(stateType: GameStateType, state: IGameState): void {
    if (this.states.has(stateType)) {
      throw new Error(`State ${stateType} is already registered`);
    }
    this.states.set(stateType, state);
  }

  /**
   * Transitions to a new state
   * @param newStateType - The state to transition to
   * @throws Error if transition is invalid or state is not registered
   */
  public transitionTo(newStateType: GameStateType): void {
    // Validate the transition
    if (!this.isValidTransition(newStateType)) {
      throw new Error(
        `Invalid state transition from ${this.currentStateType} to ${newStateType}`
      );
    }

    // Get the new state
    const newState = this.states.get(newStateType);
    if (!newState) {
      throw new Error(`State ${newStateType} is not registered`);
    }

    // Exit current state if it exists
    if (this.currentState) {
      try {
        this.currentState.exit();
      } catch (error) {
        console.error(`Error exiting state ${this.currentStateType}:`, error);
      }
    }

    // Enter new state
    try {
      newState.enter();
      this.currentState = newState;
      this.currentStateType = newStateType;
    } catch (error) {
      console.error(`Error entering state ${newStateType}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a transition to the new state is valid
   * @param newStateType - The state to transition to
   * @returns boolean indicating if the transition is valid
   */
  private isValidTransition(newStateType: GameStateType): boolean {
    if (!this.currentStateType) {
      return true; // First state transition is always valid
    }

    const allowedStates = this.allowedTransitions[this.currentStateType];
    return allowedStates?.has(newStateType) ?? false;
  }

  /**
   * Updates the current state
   * @param deltaTime - The time elapsed since the last update
   */
  public update(deltaTime: number): void {
    if (this.currentState) {
      try {
        this.currentState.update(deltaTime);
      } catch (error) {
        console.error('Error updating state:', error);
      }
    }
  }

  /**
   * Renders the current state
   */
  public render(): void {
    if (this.currentState) {
      try {
        this.currentState.render();
      } catch (error) {
        console.error('Error rendering state:', error);
      }
    }
  }

  /**
   * Gets the current state type
   * @returns The current state type or null if no state is set
   */
  public getCurrentStateType(): GameStateType | null {
    return this.currentStateType;
  }

  /**
   * Resets the state manager
   */
  public reset(): void {
    if (this.currentState) {
      this.currentState.exit();
    }
    this.currentState = null;
    this.currentStateType = null;
  }
}

export default GameStateManager;