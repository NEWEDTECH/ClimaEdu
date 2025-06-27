/**
 * Input data for archiving a post
 */
export interface ArchivePostInput {
  /**
   * Post ID to archive
   */
  postId: string;
  
  /**
   * User ID performing the action
   */
  userId: string;
}
