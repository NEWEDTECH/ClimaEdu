import { Post } from '../../entities/Post';

/**
 * Output data for publishing a post
 */
export interface PublishPostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Published post (if successful)
   */
  post?: Post;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
