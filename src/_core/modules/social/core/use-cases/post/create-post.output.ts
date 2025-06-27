import { Post } from '../../entities/Post';

/**
 * Output data for creating a post
 */
export interface CreatePostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Created post (if successful)
   */
  post?: Post;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
