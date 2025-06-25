/**
 * Output data for unliking a post
 */
export interface UnlikePostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
