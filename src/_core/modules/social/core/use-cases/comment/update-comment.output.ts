import { Comment } from '../../entities/Comment';

/**
 * Output data for updating a comment
 */
export interface UpdateCommentOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Updated comment (if successful)
   */
  comment?: Comment;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
