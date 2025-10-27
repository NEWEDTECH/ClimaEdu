/**
 * Input for RecordDailyAccessUseCase
 *
 * Simplified input - use case handles all business logic internally:
 * - Retrieves access history from repository
 * - Calculates consecutive days via entity
 * - Determines if first login
 */
export interface RecordDailyAccessInput {
  /**
   * The unique identifier of the user accessing the platform
   */
  userId: string;

  /**
   * The institution ID the user is accessing
   */
  institutionId: string;
}
