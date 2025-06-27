'use client';

import { useCallback } from 'react';
import { useSocialStore } from '@/context/zustand/useSocialStore';
import { useSocialContainer } from './useContainer';
import type { LikePostInput } from '@/_core/modules/social/core/use-cases/post-like/like-post.input';
import type { UnlikePostInput } from '@/_core/modules/social/core/use-cases/post-like/unlike-post.input';
import type { LikeCommentInput } from '@/_core/modules/social/core/use-cases/comment-like/like-comment.input';
import type { UnlikeCommentInput } from '@/_core/modules/social/core/use-cases/comment-like/unlike-comment.input';

export interface UseLikesOptions {
  userId: string;
  institutionId: string;
  onSuccess?: (type: 'post' | 'comment', id: string, isLiked: boolean) => void;
  onError?: (error: string) => void;
}

export function useLikes({ userId, institutionId, onSuccess, onError }: UseLikesOptions) {
  const { 
    likeLoading 
  } = useSocialStore();

  const container = useSocialContainer();

  // Like/Unlike Post
  const handlePostLike = useCallback(async (postId: string, isCurrentlyLiked: boolean) => {
    const store = useSocialStore.getState();
    
    if (store.likeLoading[`post-${postId}`]) return;

    try {
      store.setLikeLoading(`post-${postId}`, true);
      
      // Optimistic update
      store.togglePostLike(postId);

      if (isCurrentlyLiked) {
        // Unlike post
        const unlikePostUseCase = container.unlikePost();
        if (!unlikePostUseCase) {
          throw new Error('UnlikePostUseCase not available');
        }

        const input: UnlikePostInput = {
          postId,
          userId
        };

        const result = await unlikePostUseCase.execute(input);

        if (!result.success) {
          // Revert optimistic update on failure
          store.togglePostLike(postId);
          onError?.(result.error || 'Erro ao descurtir post');
        } else {
          onSuccess?.('post', postId, false);
        }
      } else {
        // Like post
        const likePostUseCase = container.likePost();
        if (!likePostUseCase) {
          throw new Error('LikePostUseCase not available');
        }

        const input: LikePostInput = {
          postId,
          userId,
          institutionId
        };

        const result = await likePostUseCase.execute(input);

        if (!result.success) {
          // Revert optimistic update on failure
          store.togglePostLike(postId);
          onError?.(result.error || 'Erro ao curtir post');
        } else {
          onSuccess?.('post', postId, true);
        }
      }
    } catch (error) {
      console.error('Error handling post like:', error);
      // Revert optimistic update on error
      store.togglePostLike(postId);
      onError?.('Erro inesperado ao processar curtida');
    } finally {
      store.setLikeLoading(`post-${postId}`, false);
    }
  }, [userId, institutionId, onSuccess, onError, container]);

  // Like/Unlike Comment
  const handleCommentLike = useCallback(async (
    postId: string, 
    commentId: string, 
    isCurrentlyLiked: boolean
  ) => {
    const store = useSocialStore.getState();
    
    if (store.likeLoading[`comment-${commentId}`]) return;

    try {
      store.setLikeLoading(`comment-${commentId}`, true);
      
      // Optimistic update
      store.toggleCommentLike(postId, commentId);

      if (isCurrentlyLiked) {
        // Unlike comment
        const unlikeCommentUseCase = container.unlikeComment();
        if (!unlikeCommentUseCase) {
          throw new Error('UnlikeCommentUseCase not available');
        }

        const input: UnlikeCommentInput = {
          commentId,
          userId
        };

        const result = await unlikeCommentUseCase.execute(input);

        if (!result.success) {
          // Revert optimistic update on failure
          store.toggleCommentLike(postId, commentId);
          onError?.(result.error || 'Erro ao descurtir comentário');
        } else {
          onSuccess?.('comment', commentId, false);
        }
      } else {
        // Like comment
        const likeCommentUseCase = container.likeComment();
        if (!likeCommentUseCase) {
          throw new Error('LikeCommentUseCase not available');
        }

        const input: LikeCommentInput = {
          commentId,
          userId,
          institutionId
        };

        const result = await likeCommentUseCase.execute(input);

        if (!result.success) {
          // Revert optimistic update on failure
          store.toggleCommentLike(postId, commentId);
          onError?.(result.error || 'Erro ao curtir comentário');
        } else {
          onSuccess?.('comment', commentId, true);
        }
      }
    } catch (error) {
      console.error('Error handling comment like:', error);
      // Revert optimistic update on error
      store.toggleCommentLike(postId, commentId);
      onError?.('Erro inesperado ao processar curtida');
    } finally {
      store.setLikeLoading(`comment-${commentId}`, false);
    }
  }, [userId, institutionId, onSuccess, onError, container]);

  // Batch like multiple items (for bulk operations)
  const handleBatchLike = useCallback(async (
    items: Array<{
      type: 'post' | 'comment';
      id: string;
      postId?: string; // Required for comments
      isCurrentlyLiked: boolean;
    }>
  ) => {
    const promises = items.map(item => {
      if (item.type === 'post') {
        return handlePostLike(item.id, item.isCurrentlyLiked);
      } else {
        return handleCommentLike(item.postId!, item.id, item.isCurrentlyLiked);
      }
    });

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error in batch like operation:', error);
      onError?.('Erro ao processar curtidas em lote');
    }
  }, [handlePostLike, handleCommentLike, onError]);

  // Get loading state for specific item
  const isLikeLoading = useCallback((type: 'post' | 'comment', id: string) => {
    return likeLoading[`${type}-${id}`] || false;
  }, [likeLoading]);

  // Check if user can like (rate limiting, permissions, etc.)
  const canLike = useCallback((authorId: string) => {
    // User cannot like their own content
    if (authorId === userId) return false;
    
    // Add other business rules here
    return true;
  }, [userId]);

  return {
    handlePostLike,
    handleCommentLike,
    handleBatchLike,
    isLikeLoading,
    canLike,
    likeLoading
  };
}

// Hook for getting like statistics and user lists
export function useLikeStats() {
  const { posts, comments } = useSocialStore();

  const getPostLikeStats = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    return {
      count: post?.likesCount || 0,
      isLikedByUser: post?.isLikedByUser || false,
      // In a real implementation, this would fetch the list of users who liked
      likedByUsers: [] as string[]
    };
  }, [posts]);

  const getCommentLikeStats = useCallback((postId: string, commentId: string) => {
    const postComments = comments[postId] || [];
    const comment = postComments.find(c => c.id === commentId);
    return {
      count: comment?.likesCount || 0,
      isLikedByUser: comment?.isLikedByUser || false,
      likedByUsers: [] as string[]
    };
  }, [comments]);

  const getTotalUserLikes = useCallback((userId: string) => {
    // Calculate total likes received by user across all their posts and comments
    const userPosts = posts.filter(p => p.authorId === userId);
    const postLikes = userPosts.reduce((sum, post) => sum + post.likesCount, 0);
    
    // For comments, we'd need to iterate through all comments
    // This is a simplified version
    return postLikes;
  }, [posts]);

  return {
    getPostLikeStats,
    getCommentLikeStats,
    getTotalUserLikes
  };
}

// Hook for like animations and UI feedback
export function useLikeAnimations() {
  const handleLikeAnimation = useCallback((element: HTMLElement, isLiked: boolean) => {
    if (!element) return;

    // Add animation class
    element.classList.add(isLiked ? 'animate-like' : 'animate-unlike');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      element.classList.remove('animate-like', 'animate-unlike');
    }, 300);

    // Create floating hearts effect for likes
    if (isLiked) {
      createFloatingHearts(element);
    }
  }, []);

  const createFloatingHearts = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const heartsContainer = document.createElement('div');
    heartsContainer.className = 'fixed pointer-events-none z-50';
    heartsContainer.style.left = `${rect.left + rect.width / 2}px`;
    heartsContainer.style.top = `${rect.top}px`;
    
    document.body.appendChild(heartsContainer);

    // Create multiple heart elements
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'absolute text-red-500 animate-ping';
      heart.style.left = `${Math.random() * 40 - 20}px`;
      heart.style.animationDelay = `${i * 100}ms`;
      heart.style.animationDuration = '600ms';
      
      heartsContainer.appendChild(heart);
    }

    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(heartsContainer);
    }, 1000);
  }, []);

  return {
    handleLikeAnimation,
    createFloatingHearts
  };
}
