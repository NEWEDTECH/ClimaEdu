/**
 * Input data for creating a comment
 */
export interface CreateCommentInput {
  /**
   * Post ID to comment on
   */
  postId: string;
  
  /**
   * Comment content
   */
  content: string;
  
  /**
   * Author user ID
   */
  authorId: string;
  
  /**
   * Institution ID
   */
  institutionId: string;
  
  /**
   * Parent comment ID (for replies)
   */
  parentCommentId?: string;
}
