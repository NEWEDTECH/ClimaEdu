/**
 * Output data for unliking a comment
 */
export interface UnlikeCommentOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
