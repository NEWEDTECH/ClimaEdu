/**
 * Output for RecordDailyAccessUseCase
 *
 * Indicates whether the daily access was successfully recorded
 * and provides metrics about the access.
 */
export interface RecordDailyAccessOutput {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Error object if the operation failed
   */
  error?: Error;

  /**
   * The event ID of the published UserLoginEvent (if successful)
   */
  eventId?: string;

  /**
   * Current consecutive days count (if successful)
   */
  consecutiveDays?: number;

  /**
   * Total access days count (if successful)
   */
  totalAccessDays?: number;

  /**
   * Whether this was the user's first login to this institution
   */
  isFirstLogin?: boolean;

  /**
   * Whether the access was already tracked today (no action taken)
   */
  alreadyTrackedToday?: boolean;
}
