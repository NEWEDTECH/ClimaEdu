/**
 * Input data for unliking a comment
 */
export interface UnlikeCommentInput {
  /**
   * Comment ID to unlike
   */
  commentId: string;
  
  /**
   * User ID who is unliking the comment
   */
  userId: string;
}
