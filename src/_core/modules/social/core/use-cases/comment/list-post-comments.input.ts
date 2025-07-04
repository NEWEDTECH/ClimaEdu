/**
 * Input data for listing post comments
 */
export interface ListPostCommentsInput {
  /**
   * Post ID to get comments for
   */
  postId: string;
  
  /**
   * User ID requesting the list
   */
  userId: string;
  
  /**
   * Whether to include replies (nested comments)
   */
  includeReplies?: boolean;
}
