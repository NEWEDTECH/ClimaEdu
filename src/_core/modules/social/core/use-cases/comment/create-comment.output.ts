import { Comment } from '../../entities/Comment';

/**
 * Output data for creating a comment
 */
export interface CreateCommentOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Created comment (if successful)
   */
  comment?: Comment;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
