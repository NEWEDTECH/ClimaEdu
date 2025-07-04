/**
 * Input data for creating a post
 */
export interface CreatePostInput {
  /**
   * Post title
   */
  title: string;
  
  /**
   * Post content
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
}
