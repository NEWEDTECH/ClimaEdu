import { CommentLike } from '../../entities/CommentLike';

/**
 * Output data for liking a comment
 */
export interface LikeCommentOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Created comment like (if successful)
   */
  commentLike?: CommentLike;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
