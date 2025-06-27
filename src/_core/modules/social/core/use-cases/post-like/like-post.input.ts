/**
 * Input data for liking a post
 */
export interface LikePostInput {
  /**
   * Post ID to like
   */
  postId: string;
  
  /**
   * User ID who is liking the post
   */
  userId: string;
  
  /**
   * Institution ID
   */
  institutionId: string;
}
