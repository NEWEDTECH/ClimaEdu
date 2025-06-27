import { Post } from '../../entities/Post';

/**
 * Output data for updating a post
 */
export interface UpdatePostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Updated post (if successful)
   */
  post?: Post;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
