import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import repository interfaces
import type { PostRepository } from '@/_core/modules/social/infrastructure/repositories/PostRepository';
import type { CommentRepository } from '@/_core/modules/social/infrastructure/repositories/CommentRepository';
import type { PostLikeRepository } from '@/_core/modules/social/infrastructure/repositories/PostLikeRepository';
import type { CommentLikeRepository } from '@/_core/modules/social/infrastructure/repositories/CommentLikeRepository';

// Import repository implementations
import { FirestorePostRepository } from '@/_core/modules/social/infrastructure/implementations/FirestorePostRepository';
import { FirestoreCommentRepository } from '@/_core/modules/social/infrastructure/implementations/FirestoreCommentRepository';
import { FirestorePostLikeRepository } from '@/_core/modules/social/infrastructure/implementations/FirestorePostLikeRepository';
import { FirestoreCommentLikeRepository } from '@/_core/modules/social/infrastructure/implementations/FirestoreCommentLikeRepository';

// Import use cases
import { CreatePostUseCase } from '@/_core/modules/social/core/use-cases/post/create-post.use-case';
import { UpdatePostUseCase } from '@/_core/modules/social/core/use-cases/post/update-post.use-case';
import { PublishPostUseCase } from '@/_core/modules/social/core/use-cases/post/publish-post.use-case';
import { ArchivePostUseCase } from '@/_core/modules/social/core/use-cases/post/archive-post.use-case';
import { GetPostUseCase } from '@/_core/modules/social/core/use-cases/post/get-post.use-case';
import { ListPostsUseCase } from '@/_core/modules/social/core/use-cases/post/list-posts.use-case';
import { ListMyPostsUseCase } from '@/_core/modules/social/core/use-cases/post/list-my-posts.use-case';
import { DeletePostUseCase } from '@/_core/modules/social/core/use-cases/post/delete-post.use-case';
import { LikePostUseCase } from '@/_core/modules/social/core/use-cases/post-like/like-post.use-case';
import { UnlikePostUseCase } from '@/_core/modules/social/core/use-cases/post-like/unlike-post.use-case';
import { GetPostLikesUseCase } from '@/_core/modules/social/core/use-cases/post-like/get-post-likes.use-case';
import { CreateCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/create-comment.use-case';
import { ReplyToCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/reply-to-comment.use-case';
import { UpdateCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/update-comment.use-case';
import { DeleteCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/delete-comment.use-case';
import { ListPostCommentsUseCase } from '@/_core/modules/social/core/use-cases/comment/list-post-comments.use-case';
import { LikeCommentUseCase } from '@/_core/modules/social/core/use-cases/comment-like/like-comment.use-case';
import { UnlikeCommentUseCase } from '@/_core/modules/social/core/use-cases/comment-like/unlike-comment.use-case';
import { GetCommentLikesUseCase } from '@/_core/modules/social/core/use-cases/comment-like/get-comment-likes.use-case';

/**
 * Register Social module dependencies
 * @param container The DI container
 */
export function registerSocialModule(container: Container): void {
  // Register repositories (singleton pattern)
  container.bind<PostRepository>(repositories.PostRepository).to(FirestorePostRepository).inSingletonScope();
  container.bind<CommentRepository>(repositories.CommentRepository).to(FirestoreCommentRepository).inSingletonScope();
  container.bind<PostLikeRepository>(repositories.PostLikeRepository).to(FirestorePostLikeRepository).inSingletonScope();
  container.bind<CommentLikeRepository>(repositories.CommentLikeRepository).to(FirestoreCommentLikeRepository).inSingletonScope();
  
  // Register use cases (transient pattern)
  // Post use cases
  container.bind(useCases.CreatePostUseCase).to(CreatePostUseCase);
  container.bind(useCases.UpdatePostUseCase).to(UpdatePostUseCase);
  container.bind(useCases.PublishPostUseCase).to(PublishPostUseCase);
  container.bind(useCases.ArchivePostUseCase).to(ArchivePostUseCase);
  container.bind(useCases.GetPostUseCase).to(GetPostUseCase);
  container.bind(useCases.ListPostsUseCase).to(ListPostsUseCase);
  container.bind(useCases.ListMyPostsUseCase).to(ListMyPostsUseCase);
  container.bind(useCases.DeletePostUseCase).to(DeletePostUseCase);
  
  // Post like use cases
  container.bind(useCases.LikePostUseCase).to(LikePostUseCase);
  container.bind(useCases.UnlikePostUseCase).to(UnlikePostUseCase);
  container.bind(useCases.GetPostLikesUseCase).to(GetPostLikesUseCase);
  
  // Comment use cases
  container.bind(useCases.CreateCommentUseCase).to(CreateCommentUseCase);
  container.bind(useCases.ReplyToCommentUseCase).to(ReplyToCommentUseCase);
  container.bind(useCases.UpdateCommentUseCase).to(UpdateCommentUseCase);
  container.bind(useCases.DeleteCommentUseCase).to(DeleteCommentUseCase);
  container.bind(useCases.ListPostCommentsUseCase).to(ListPostCommentsUseCase);
  
  // Comment like use cases
  container.bind(useCases.LikeCommentUseCase).to(LikeCommentUseCase);
  container.bind(useCases.UnlikeCommentUseCase).to(UnlikeCommentUseCase);
  container.bind(useCases.GetCommentLikesUseCase).to(GetCommentLikesUseCase);
}
