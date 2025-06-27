/**
 * Output data for deleting a comment
 */
export interface DeleteCommentOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
