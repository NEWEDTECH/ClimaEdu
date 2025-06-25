import { PostWithMetadata } from './list-posts.output';

/**
 * Output data for listing user's own posts
 */
export interface ListMyPostsOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * List of user's posts with metadata (if successful)
   */
  posts?: PostWithMetadata[];
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
