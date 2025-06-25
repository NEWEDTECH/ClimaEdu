// Export entities
export { Post, PostStatus } from './core/entities/Post';
export { Comment } from './core/entities/Comment';
export { PostLike } from './core/entities/PostLike';
export { CommentLike } from './core/entities/CommentLike';

// Export repository interfaces
export type { PostRepository } from './infrastructure/repositories/PostRepository';
export type { CommentRepository } from './infrastructure/repositories/CommentRepository';
export type { PostLikeRepository } from './infrastructure/repositories/PostLikeRepository';
export type { CommentLikeRepository } from './infrastructure/repositories/CommentLikeRepository';

// Export repository implementations
export { FirestorePostRepository } from './infrastructure/implementations/FirestorePostRepository';
export { FirestoreCommentRepository } from './infrastructure/implementations/FirestoreCommentRepository';
export { FirestorePostLikeRepository } from './infrastructure/implementations/FirestorePostLikeRepository';
export { FirestoreCommentLikeRepository } from './infrastructure/implementations/FirestoreCommentLikeRepository';

// Export use cases
export { CreatePostUseCase } from './core/use-cases/post/create-post.use-case';
export { UpdatePostUseCase } from './core/use-cases/post/update-post.use-case';
export { PublishPostUseCase } from './core/use-cases/post/publish-post.use-case';
export { ListPostsUseCase } from './core/use-cases/post/list-posts.use-case';
export { LikePostUseCase } from './core/use-cases/post-like/like-post.use-case';
export { UnlikePostUseCase } from './core/use-cases/post-like/unlike-post.use-case';
export { CreateCommentUseCase } from './core/use-cases/comment/create-comment.use-case';
export { ListPostCommentsUseCase } from './core/use-cases/comment/list-post-comments.use-case';
export { LikeCommentUseCase } from './core/use-cases/comment-like/like-comment.use-case';

// Export use case inputs and outputs
export type { CreatePostInput } from './core/use-cases/post/create-post.input';
export type { CreatePostOutput } from './core/use-cases/post/create-post.output';
export type { UpdatePostInput } from './core/use-cases/post/update-post.input';
export type { UpdatePostOutput } from './core/use-cases/post/update-post.output';
export type { PublishPostInput } from './core/use-cases/post/publish-post.input';
export type { PublishPostOutput } from './core/use-cases/post/publish-post.output';
export type { ListPostsInput } from './core/use-cases/post/list-posts.input';
export type { ListPostsOutput, PostWithMetadata } from './core/use-cases/post/list-posts.output';
export type { LikePostInput } from './core/use-cases/post-like/like-post.input';
export type { LikePostOutput } from './core/use-cases/post-like/like-post.output';
export type { UnlikePostInput } from './core/use-cases/post-like/unlike-post.input';
export type { UnlikePostOutput } from './core/use-cases/post-like/unlike-post.output';
export type { CreateCommentInput } from './core/use-cases/comment/create-comment.input';
export type { CreateCommentOutput } from './core/use-cases/comment/create-comment.output';
export type { ListPostCommentsInput } from './core/use-cases/comment/list-post-comments.input';
export type { ListPostCommentsOutput, CommentWithMetadata } from './core/use-cases/comment/list-post-comments.output';
export type { LikeCommentInput } from './core/use-cases/comment-like/like-comment.input';
export type { LikeCommentOutput } from './core/use-cases/comment-like/like-comment.output';

// Export container symbols
export { SocialSymbols } from '@/_core/shared/container/modules/social/symbols';
