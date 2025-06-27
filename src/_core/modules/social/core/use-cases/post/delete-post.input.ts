/**
 * Input data for deleting a post
 */
export interface DeletePostInput {
  /**
   * Post ID to delete
   */
  postId: string;
  
  /**
   * User ID performing the action
   */
  userId: string;
}
