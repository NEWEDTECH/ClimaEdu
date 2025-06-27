import { Comment } from '../../entities/Comment';

/**
 * Comment with additional metadata for listing
 */
export interface CommentWithMetadata {
  /**
   * The comment entity
   */
  comment: Comment;
  
  /**
   * Number of likes on this comment
   */
  likesCount: number;
  
  /**
   * Whether the requesting user has liked this comment
   */
  isLikedByUser: boolean;
  
  /**
   * Replies to this comment (if includeReplies is true)
   */
  replies?: CommentWithMetadata[];
}

/**
 * Output data for listing post comments
 */
export interface ListPostCommentsOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * List of comments with metadata (if successful)
   */
  comments?: CommentWithMetadata[];
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
