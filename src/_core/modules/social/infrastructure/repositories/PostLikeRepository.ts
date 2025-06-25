import { PostLike } from '../../core/entities/PostLike';

export interface PostLikeRepository {
  generateId(): Promise<string>;
  save(postLike: PostLike): Promise<PostLike>;
  findById(id: string): Promise<PostLike | null>;
  findByPost(postId: string): Promise<PostLike[]>;
  findByUserAndPost(userId: string, postId: string): Promise<PostLike | null>;
  countByPost(postId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
