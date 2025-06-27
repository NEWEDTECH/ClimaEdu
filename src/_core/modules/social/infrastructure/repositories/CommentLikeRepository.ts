import { CommentLike } from '../../core/entities/CommentLike';

export interface CommentLikeRepository {
  generateId(): Promise<string>;
  save(commentLike: CommentLike): Promise<CommentLike>;
  findById(id: string): Promise<CommentLike | null>;
  findByComment(commentId: string): Promise<CommentLike[]>;
  findByUserAndComment(userId: string, commentId: string): Promise<CommentLike | null>;
  countByComment(commentId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
