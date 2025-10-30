/**
 * Match State Machine
 * 
 * Defines explicit states and transitions for match cards.
 * Ensures type-safe state management and validates state transitions.
 */

import { debug, debugFlow } from '@/lib/debug';

/**
 * Match card states
 */
export type MatchCardState = 'none' | 'pending_sent' | 'pending_received' | 'matched' | 'declined';

/**
 * Valid state transition map
 * Key: current state
 * Value: array of valid next states
 */
const VALID_TRANSITIONS: Record<MatchCardState, MatchCardState[]> = {
  none: ['pending_sent', 'pending_received', 'declined'],
  pending_sent: ['matched', 'declined'],
  pending_received: ['matched', 'declined'],
  matched: [], // Terminal state - no transitions
  declined: [], // Terminal state - no transitions
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  currentState: MatchCardState,
  nextState: MatchCardState
): boolean {
  const validNextStates = VALID_TRANSITIONS[currentState];
  return validNextStates.includes(nextState);
}

/**
 * Transition to a new state with validation
 * Throws error if transition is invalid
 */
export function transition(
  userId: string,
  displayName: string,
  currentState: MatchCardState,
  nextState: MatchCardState,
  trigger?: string
): MatchCardState {
  if (!isValidTransition(currentState, nextState)) {
    const error = `Invalid transition: ${currentState} → ${nextState}`;
    debug('MatchStateMachine', 'error', error, { userId, displayName });
    throw new Error(error);
  }

  debugFlow.stateChange(
    'MatchCard',
    currentState,
    nextState,
    trigger || `User: ${displayName}`
  );

  return nextState;
}

/**
 * Get human-readable description of a state
 */
export function getStateDescription(state: MatchCardState): string {
  switch (state) {
    case 'none':
      return 'No interaction yet';
    case 'pending_sent':
      return 'Waiting for their response';
    case 'pending_received':
      return 'They want to match with you!';
    case 'matched':
      return 'It\'s a match! 🎉';
    case 'declined':
      return 'Declined';
    default:
      return 'Unknown state';
  }
}

/**
 * Determine button states based on match card state
 */
export function getButtonStates(state: MatchCardState): {
  canAccept: boolean;
  canDecline: boolean;
  acceptLabel: string;
  declineLabel: string;
} {
  switch (state) {
    case 'none':
      return {
        canAccept: true,
        canDecline: true,
        acceptLabel: 'Match',
        declineLabel: 'Decline',
      };
    case 'pending_received':
      return {
        canAccept: true,
        canDecline: true,
        acceptLabel: 'Accept Match',
        declineLabel: 'Decline',
      };
    case 'pending_sent':
      return {
        canAccept: false,
        canDecline: true,
        acceptLabel: 'Pending',
        declineLabel: 'Cancel',
      };
    case 'matched':
      return {
        canAccept: false,
        canDecline: false,
        acceptLabel: 'Matched!',
        declineLabel: '',
      };
    case 'declined':
      return {
        canAccept: false,
        canDecline: false,
        acceptLabel: '',
        declineLabel: 'Declined',
      };
  }
}

/**
 * Check if a candidate should be removed from the list
 * after a state transition
 */
export function shouldRemoveFromList(state: MatchCardState): boolean {
  return state === 'matched' || state === 'declined';
}

/**
 * Validate state from backend response
 * Ensures backend state is one of our known states
 */
export function validateState(state: string): MatchCardState {
  const validStates: MatchCardState[] = [
    'none',
    'pending_sent',
    'pending_received',
    'matched',
    'declined',
  ];

  if (validStates.includes(state as MatchCardState)) {
    return state as MatchCardState;
  }

  debug('MatchStateMachine', 'warn', `Invalid state from backend: ${state}`, {
    defaulting: 'none',
  });
  return 'none';
}

/**
 * State machine for managing match card lifecycle
 */
export class MatchStateMachine {
  private state: MatchCardState;
  private userId: string;
  private displayName: string;

  constructor(userId: string, displayName: string, initialState: MatchCardState = 'none') {
    this.userId = userId;
    this.displayName = displayName;
    this.state = validateState(initialState);

    debug('MatchStateMachine', 'info', `Initialized for ${displayName}`, {
      userId,
      initialState: this.state,
    });
  }

  /**
   * Get current state
   */
  getState(): MatchCardState {
    return this.state;
  }

  /**
   * Attempt to transition to a new state
   * Returns true if transition succeeded, false otherwise
   */
  transitionTo(nextState: MatchCardState, trigger?: string): boolean {
    try {
      this.state = transition(
        this.userId,
        this.displayName,
        this.state,
        nextState,
        trigger
      );
      return true;
    } catch (error) {
      debug('MatchStateMachine', 'error', `Transition failed`, {
        userId: this.userId,
        displayName: this.displayName,
        error,
      });
      return false;
    }
  }

  /**
   * Handle user clicking "Match" or "Accept"
   */
  handleAccept(): boolean {
    if (this.state === 'none') {
      return this.transitionTo('pending_sent', 'User clicked Match');
    } else if (this.state === 'pending_received') {
      return this.transitionTo('matched', 'User accepted match request');
    }
    return false;
  }

  /**
   * Handle user clicking "Decline" or "Cancel"
   */
  handleDecline(): boolean {
    return this.transitionTo('declined', 'User declined');
  }

  /**
   * Handle backend confirming mutual match
   */
  handleMutualMatch(): boolean {
    if (this.state === 'pending_sent' || this.state === 'pending_received') {
      return this.transitionTo('matched', 'Mutual match confirmed by backend');
    }
    return false;
  }

  /**
   * Get button states for UI rendering
   */
  getButtonStates() {
    return getButtonStates(this.state);
  }

  /**
   * Check if card should be removed from list
   */
  shouldRemove(): boolean {
    return shouldRemoveFromList(this.state);
  }

  /**
   * Get human-readable state description
   */
  getDescription(): string {
    return getStateDescription(this.state);
  }
}
