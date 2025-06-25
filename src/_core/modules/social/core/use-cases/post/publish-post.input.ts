/**
 * Input data for publishing a post
 */
export interface PublishPostInput {
  /**
   * Post ID to publish
   */
  postId: string;
  
  /**
   * User ID performing the action
   */
  userId: string;
}
