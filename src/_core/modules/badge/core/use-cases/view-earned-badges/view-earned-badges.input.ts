/**
 * Input data for viewing earned badges
 */
export interface ViewEarnedBadgesInput {
  /**
   * The ID of the user whose badges to view
   */
  userId: string;

  /**
   * The ID of the institution context
   */
  institutionId: string;
}
