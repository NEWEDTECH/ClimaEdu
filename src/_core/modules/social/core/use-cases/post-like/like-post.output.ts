import { PostLike } from '../../entities/PostLike';

/**
 * Output data for liking a post
 */
export interface LikePostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Created post like (if successful)
   */
  postLike?: PostLike;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
