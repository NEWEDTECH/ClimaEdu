import { Post } from '../../entities/Post';

/**
 * Post with additional metadata for listing
 */
export interface PostWithMetadata {
  /**
   * The post entity
   */
  post: Post;
  
  /**
   * Number of likes on this post
   */
  likesCount: number;
  
  /**
   * Whether the requesting user has liked this post
   */
  isLikedByUser: boolean;
  
  /**
   * Number of comments on this post
   */
  commentsCount: number;
}

/**
 * Output data for listing posts
 */
export interface ListPostsOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * List of posts with metadata (if successful)
   */
  posts?: PostWithMetadata[];
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
