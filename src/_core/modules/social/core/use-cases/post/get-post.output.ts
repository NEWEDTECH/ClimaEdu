import { Post } from '../../entities/Post';

/**
 * Post with additional metadata for single post view
 */
export interface PostWithFullMetadata {
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
 * Output data for getting a post
 */
export interface GetPostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Post with metadata (if successful)
   */
  postData?: PostWithFullMetadata;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
