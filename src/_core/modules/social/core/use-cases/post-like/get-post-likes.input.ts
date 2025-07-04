/**
 * Input data for getting post likes information
 */
export interface GetPostLikesInput {
  /**
   * Post ID to get likes for
   */
  postId: string;
  
  /**
   * User ID requesting the information
   */
  userId: string;
}
