/**
 * Input data for updating a post
 */
export interface UpdatePostInput {
  /**
   * Post ID to update
   */
  postId: string;
  
  /**
   * New title (optional)
   */
  title?: string;
  
  /**
   * New content (optional)
   */
  content?: string;
  
  /**
   * User ID performing the update
   */
  userId: string;
}
