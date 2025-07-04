'use client';

import { useCallback } from 'react';
import { container } from '@/_core/shared/container';
import { SocialSymbols } from '@/_core/modules/social';

// Import use case types
import type { CreatePostUseCase } from '@/_core/modules/social/core/use-cases/post/create-post.use-case';
import type { UpdatePostUseCase } from '@/_core/modules/social/core/use-cases/post/update-post.use-case';
import type { PublishPostUseCase } from '@/_core/modules/social/core/use-cases/post/publish-post.use-case';
import type { ListPostsUseCase } from '@/_core/modules/social/core/use-cases/post/list-posts.use-case';
import type { GetPostUseCase } from '@/_core/modules/social/core/use-cases/post/get-post.use-case';
import type { ListMyPostsUseCase } from '@/_core/modules/social/core/use-cases/post/list-my-posts.use-case';
import type { ArchivePostUseCase } from '@/_core/modules/social/core/use-cases/post/archive-post.use-case';
import type { DeletePostUseCase } from '@/_core/modules/social/core/use-cases/post/delete-post.use-case';
import type { LikePostUseCase } from '@/_core/modules/social/core/use-cases/post-like/like-post.use-case';
import type { UnlikePostUseCase } from '@/_core/modules/social/core/use-cases/post-like/unlike-post.use-case';
import type { CreateCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/create-comment.use-case';
import type { ListPostCommentsUseCase } from '@/_core/modules/social/core/use-cases/comment/list-post-comments.use-case';
import type { UpdateCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/update-comment.use-case';
import type { DeleteCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/delete-comment.use-case';
import type { ReplyToCommentUseCase } from '@/_core/modules/social/core/use-cases/comment/reply-to-comment.use-case';
import type { LikeCommentUseCase } from '@/_core/modules/social/core/use-cases/comment-like/like-comment.use-case';
import type { UnlikeCommentUseCase } from '@/_core/modules/social/core/use-cases/comment-like/unlike-comment.use-case';

/**
 * Hook to access social use cases from the DI container
 */
export function useSocialContainer() {
  // Post use cases
  const getCreatePostUseCase = useCallback(() => {
    return container.get<CreatePostUseCase>(SocialSymbols.useCases.CreatePostUseCase);
  }, []);

  const getUpdatePostUseCase = useCallback(() => {
    return container.get<UpdatePostUseCase>(SocialSymbols.useCases.UpdatePostUseCase);
  }, []);

  const getPublishPostUseCase = useCallback(() => {
    return container.get<PublishPostUseCase>(SocialSymbols.useCases.PublishPostUseCase);
  }, []);

  const getListPostsUseCase = useCallback(() => {
    return container.get<ListPostsUseCase>(SocialSymbols.useCases.ListPostsUseCase);
  }, []);

  const getGetPostUseCase = useCallback(() => {
    return container.get<GetPostUseCase>(SocialSymbols.useCases.GetPostUseCase);
  }, []);

  const getListMyPostsUseCase = useCallback(() => {
    return container.get<ListMyPostsUseCase>(SocialSymbols.useCases.ListMyPostsUseCase);
  }, []);

  const getArchivePostUseCase = useCallback(() => {
    return container.get<ArchivePostUseCase>(SocialSymbols.useCases.ArchivePostUseCase);
  }, []);

  const getDeletePostUseCase = useCallback(() => {
    return container.get<DeletePostUseCase>(SocialSymbols.useCases.DeletePostUseCase);
  }, []);

  // Post like use cases
  const getLikePostUseCase = useCallback(() => {
    return container.get<LikePostUseCase>(SocialSymbols.useCases.LikePostUseCase);
  }, []);

  const getUnlikePostUseCase = useCallback(() => {
    return container.get<UnlikePostUseCase>(SocialSymbols.useCases.UnlikePostUseCase);
  }, []);

  // Comment use cases
  const getCreateCommentUseCase = useCallback(() => {
    return container.get<CreateCommentUseCase>(SocialSymbols.useCases.CreateCommentUseCase);
  }, []);

  const getListPostCommentsUseCase = useCallback(() => {
    return container.get<ListPostCommentsUseCase>(SocialSymbols.useCases.ListPostCommentsUseCase);
  }, []);

  const getUpdateCommentUseCase = useCallback(() => {
    return container.get<UpdateCommentUseCase>(SocialSymbols.useCases.UpdateCommentUseCase);
  }, []);

  const getDeleteCommentUseCase = useCallback(() => {
    return container.get<DeleteCommentUseCase>(SocialSymbols.useCases.DeleteCommentUseCase);
  }, []);

  const getReplyToCommentUseCase = useCallback(() => {
    return container.get<ReplyToCommentUseCase>(SocialSymbols.useCases.ReplyToCommentUseCase);
  }, []);

  // Comment like use cases
  const getLikeCommentUseCase = useCallback(() => {
    return container.get<LikeCommentUseCase>(SocialSymbols.useCases.LikeCommentUseCase);
  }, []);

  const getUnlikeCommentUseCase = useCallback(() => {
    return container.get<UnlikeCommentUseCase>(SocialSymbols.useCases.UnlikeCommentUseCase);
  }, []);

  // Helper function to safely get use case with error handling
  const safeGetUseCase = useCallback(<T>(getter: () => T, fallbackName: string): T | null => {
    try {
      return getter();
    } catch (error) {
      console.error(`Failed to get ${fallbackName} from container:`, error);
      return null;
    }
  }, []);

  return {
    // Post use cases
    createPost: () => safeGetUseCase(getCreatePostUseCase, 'CreatePostUseCase'),
    updatePost: () => safeGetUseCase(getUpdatePostUseCase, 'UpdatePostUseCase'),
    publishPost: () => safeGetUseCase(getPublishPostUseCase, 'PublishPostUseCase'),
    listPosts: () => safeGetUseCase(getListPostsUseCase, 'ListPostsUseCase'),
    getPost: () => safeGetUseCase(getGetPostUseCase, 'GetPostUseCase'),
    listMyPosts: () => safeGetUseCase(getListMyPostsUseCase, 'ListMyPostsUseCase'),
    archivePost: () => safeGetUseCase(getArchivePostUseCase, 'ArchivePostUseCase'),
    deletePost: () => safeGetUseCase(getDeletePostUseCase, 'DeletePostUseCase'),
    
    // Post like use cases
    likePost: () => safeGetUseCase(getLikePostUseCase, 'LikePostUseCase'),
    unlikePost: () => safeGetUseCase(getUnlikePostUseCase, 'UnlikePostUseCase'),
    
    // Comment use cases
    createComment: () => safeGetUseCase(getCreateCommentUseCase, 'CreateCommentUseCase'),
    listComments: () => safeGetUseCase(getListPostCommentsUseCase, 'ListPostCommentsUseCase'),
    updateComment: () => safeGetUseCase(getUpdateCommentUseCase, 'UpdateCommentUseCase'),
    deleteComment: () => safeGetUseCase(getDeleteCommentUseCase, 'DeleteCommentUseCase'),
    replyToComment: () => safeGetUseCase(getReplyToCommentUseCase, 'ReplyToCommentUseCase'),
    
    // Comment like use cases
    likeComment: () => safeGetUseCase(getLikeCommentUseCase, 'LikeCommentUseCase'),
    unlikeComment: () => safeGetUseCase(getUnlikeCommentUseCase, 'UnlikeCommentUseCase'),
  };
}

/**
 * Hook to check if the container is properly initialized
 */
export function useContainerStatus() {
  const checkContainer = useCallback(() => {
    try {
      // Try to get a simple use case to test container
      container.get(SocialSymbols.useCases.ListPostsUseCase);
      return { isReady: true, error: null };
    } catch (error) {
      return { 
        isReady: false, 
        error: error instanceof Error ? error.message : 'Container not initialized' 
      };
    }
  }, []);

  return checkContainer();
}
