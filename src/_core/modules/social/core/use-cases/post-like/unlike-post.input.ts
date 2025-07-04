/**
 * Input data for unliking a post
 */
export interface UnlikePostInput {
  /**
   * Post ID to unlike
   */
  postId: string;
  
  /**
   * User ID who is unliking the post
   */
  userId: string;
}
