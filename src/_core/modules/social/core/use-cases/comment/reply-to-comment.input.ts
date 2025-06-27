/**
 * Input data for replying to a comment
 */
export interface ReplyToCommentInput {
  /**
   * Parent comment ID to reply to
   */
  parentCommentId: string;
  
  /**
   * Content of the reply
   */
  content: string;
  
  /**
   * Author ID of the reply
   */
  authorId: string;
  
  /**
   * Institution ID
   */
  institutionId: string;
}
