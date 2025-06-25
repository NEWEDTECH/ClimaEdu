import { Post, PostStatus } from '../../core/entities/Post';

export interface PostRepository {
  generateId(): Promise<string>;
  save(post: Post): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findByAuthor(authorId: string, institutionId: string): Promise<Post[]>;
  findByInstitution(institutionId: string, status?: PostStatus): Promise<Post[]>;
  findPublishedPosts(institutionId: string, limit?: number, offset?: number): Promise<Post[]>;
  delete(id: string): Promise<void>;
}
