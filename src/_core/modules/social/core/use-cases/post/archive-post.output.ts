import { Post } from '../../entities/Post';

/**
 * Output data for archiving a post
 */
export interface ArchivePostOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Archived post (if successful)
   */
  post?: Post;
  
  /**
   * Error message (if failed)
   */
  error?: string;
}
