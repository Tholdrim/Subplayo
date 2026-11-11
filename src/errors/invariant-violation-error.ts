export enum InvariantId {
  PLAYLIST_NAMES_SEARCH_EXHAUSTED = 'PLAYLIST_NAMES_SEARCH_EXHAUSTED'
}

export class InvariantViolationError extends Error {
  readonly invariantId: InvariantId;

  constructor(invariantId: InvariantId) {
    super(`Invariant violated: ${invariantId}`);
    this.name = 'InvariantViolationError';
    this.invariantId = invariantId;
  }
}
