/**
 * Input data for getting comment likes information
 */
export interface GetCommentLikesInput {
  /**
   * Comment ID to get likes for
   */
  commentId: string;
  
  /**
   * User ID requesting the information
   */
  userId: string;
}
