// Social module symbols

// Repository symbols
export const repositories = {
  PostRepository: Symbol.for('PostRepository'),
  CommentRepository: Symbol.for('CommentRepository'),
  PostLikeRepository: Symbol.for('PostLikeRepository'),
  CommentLikeRepository: Symbol.for('CommentLikeRepository'),
};

// Use case symbols
export const useCases = {
  // Post use cases
  CreatePostUseCase: Symbol.for('CreatePostUseCase'),
  UpdatePostUseCase: Symbol.for('UpdatePostUseCase'),
  PublishPostUseCase: Symbol.for('PublishPostUseCase'),
  ArchivePostUseCase: Symbol.for('ArchivePostUseCase'),
  GetPostUseCase: Symbol.for('GetPostUseCase'),
  ListPostsUseCase: Symbol.for('ListPostsUseCase'),
  ListMyPostsUseCase: Symbol.for('ListMyPostsUseCase'),
  DeletePostUseCase: Symbol.for('DeletePostUseCase'),
  
  // Post like use cases
  LikePostUseCase: Symbol.for('LikePostUseCase'),
  UnlikePostUseCase: Symbol.for('UnlikePostUseCase'),
  GetPostLikesUseCase: Symbol.for('GetPostLikesUseCase'),
  
  // Comment use cases
  CreateCommentUseCase: Symbol.for('CreateCommentUseCase'),
  ReplyToCommentUseCase: Symbol.for('ReplyToCommentUseCase'),
  UpdateCommentUseCase: Symbol.for('UpdateCommentUseCase'),
  DeleteCommentUseCase: Symbol.for('DeleteCommentUseCase'),
  GetCommentUseCase: Symbol.for('GetCommentUseCase'),
  ListPostCommentsUseCase: Symbol.for('ListPostCommentsUseCase'),
  
  // Comment like use cases
  LikeCommentUseCase: Symbol.for('LikeCommentUseCase'),
  UnlikeCommentUseCase: Symbol.for('UnlikeCommentUseCase'),
  GetCommentLikesUseCase: Symbol.for('GetCommentLikesUseCase'),
};

// Export all symbols for this module
export const SocialSymbols = {
  repositories,
  useCases,
};
