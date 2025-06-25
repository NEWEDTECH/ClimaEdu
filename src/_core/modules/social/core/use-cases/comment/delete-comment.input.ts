/**
 * Input data for deleting a comment
 */
export interface DeleteCommentInput {
  /**
   * Comment ID to delete
   */
  commentId: string;
  
  /**
   * User ID performing the action
   */
  userId: string;
}
