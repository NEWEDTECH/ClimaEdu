import { PostStatus } from '../../entities/Post';

/**
 * Input data for listing posts
 */
export interface ListPostsInput {
  /**
   * Institution ID to filter posts
   */
  institutionId: string;
  
  /**
   * User ID requesting the list
   */
  userId: string;
  
  /**
   * Post status filter (optional)
   */
  status?: PostStatus;
  
  /**
   * Maximum number of posts to return
   */
  limit?: number;
  
  /**
   * Include only posts from specific author (optional)
   */
  authorId?: string;
}
