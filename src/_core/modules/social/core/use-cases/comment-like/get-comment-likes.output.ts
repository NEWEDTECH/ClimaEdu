/**
 * Output data for getting comment likes information
 */
export interface GetCommentLikesOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Total number of likes on the comment
   */
  likesCount?: number;
  
  /**
   * Whether the requesting user has liked this comment
   */
  isLikedByUser?: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
