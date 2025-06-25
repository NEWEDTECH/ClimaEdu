/**
 * Output data for getting post likes information
 */
export interface GetPostLikesOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Total number of likes on the post
   */
  likesCount?: number;
  
  /**
   * Whether the requesting user has liked this post
   */
  isLikedByUser?: boolean;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
