import { Comment } from '../../entities/Comment';

/**
 * Output data for replying to a comment
 */
export interface ReplyToCommentOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Created reply comment (if successful)
   */
  comment?: Comment;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
