import { Comment } from '../../core/entities/Comment';

export interface CommentRepository {
  generateId(): Promise<string>;
  save(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPost(postId: string): Promise<Comment[]>;
  findReplies(parentCommentId: string): Promise<Comment[]>;
  findByAuthor(authorId: string, institutionId: string): Promise<Comment[]>;
  delete(id: string): Promise<void>;
}
