/**
 * Input data for updating a comment
 */
export interface UpdateCommentInput {
  /**
   * Comment ID to update
   */
  commentId: string;
  
  /**
   * New content for the comment
   */
  content: string;
  
  /**
   * User ID performing the action
   */
  userId: string;
}
