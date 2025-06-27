/**
 * Output data for deleting a post
 */
export interface DeletePostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
