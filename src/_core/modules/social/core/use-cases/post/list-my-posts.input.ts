import { PostStatus } from '../../entities/Post';

/**
 * Input data for listing user's own posts
 */
export interface ListMyPostsInput {
  /**
   * User ID whose posts to list
   */
  userId: string;
  
  /**
   * Institution ID to filter posts
   */
  institutionId: string;
  
  /**
   * Post status filter (optional)
   */
  status?: PostStatus;
  
  /**
   * Maximum number of posts to return
   */
  limit?: number;
}
