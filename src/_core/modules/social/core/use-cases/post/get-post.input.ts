/**
 * Input data for getting a post
 */
export interface GetPostInput {
  /**
   * Post ID to retrieve
   */
  postId: string;
  
  /**
   * User ID requesting the post
   */
  userId: string;
}
