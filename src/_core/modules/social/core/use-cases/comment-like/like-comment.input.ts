/**
 * Input data for liking a comment
 */
export interface LikeCommentInput {
  /**
   * Comment ID to like
   */
  commentId: string;
  
  /**
   * User ID who is liking the comment
   */
  userId: string;
  
  /**
   * Institution ID
   */
  institutionId: string;
}
