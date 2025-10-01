'use client';

import { useCallback, useState } from 'react';
import { useSocialStore, type SocialComment } from '@/context/zustand/useSocialStore';
import { useSocialContainer } from './useContainer';
import type { CommentWithMetadata } from '@/_core/modules/social/core/use-cases/comment/list-post-comments.output';
import type { CreateCommentInput } from '@/_core/modules/social/core/use-cases/comment/create-comment.input';
import type { ReplyToCommentInput } from '@/_core/modules/social/core/use-cases/comment/reply-to-comment.input';
import type { UpdateCommentInput } from '@/_core/modules/social/core/use-cases/comment/update-comment.input';
import type { DeleteCommentInput } from '@/_core/modules/social/core/use-cases/comment/delete-comment.input';

// Helper function to convert backend comment data to frontend format
function convertCommentWithMetadata(commentData: CommentWithMetadata): SocialComment {
  const { comment, likesCount, isLikedByUser } = commentData;
  
  return {
    id: comment.id,
    postId: comment.postId,
    parentCommentId: comment.parentCommentId,
    authorId: comment.authorId,
    institutionId: comment.institutionId,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    likesCount,
    isLikedByUser,
    // TODO: Add author info when available
    author: undefined
  };
}

export interface UseCommentsOptions {
  userId: string;
  institutionId: string;
  onSuccess?: (action: 'create' | 'update' | 'delete' | 'reply', commentId: string) => void;
  onError?: (error: string) => void;
}

export function useComments({ userId, institutionId, onSuccess, onError }: UseCommentsOptions) {
  const {
    comments,
    commentsLoading
  } = useSocialStore();

  const container = useSocialContainer();

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId: string, forceRefresh = false) => {
    const store = useSocialStore.getState();
    const cacheKey = `comments-${postId}`;
    
    if (!forceRefresh && store.isCacheValid(cacheKey)) {
      return store.comments[postId] || [];
    }

    try {
      store.setCommentsLoading(true);
      store.setCommentsError(null);

      const listCommentsUseCase = container.listComments();
      if (!listCommentsUseCase) {
        throw new Error('ListPostCommentsUseCase not available');
      }

      const result = await listCommentsUseCase.execute({
        postId,
        userId,
        includeReplies: true
      });

      if (result.success && result.comments) {
        const convertedComments = result.comments.map(convertCommentWithMetadata);
        store.setComments(postId, convertedComments);
        store.updateLastFetchTime(cacheKey);
        return convertedComments;
      } else {
        const error = result.error || 'Erro ao carregar comentários';
        store.setCommentsError(error);
        onError?.(error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      const errorMessage = 'Erro inesperado ao carregar comentários';
      store.setCommentsError(errorMessage);
      onError?.(errorMessage);
      return [];
    } finally {
      store.setCommentsLoading(false);
    }
  }, [userId, onError, container]);

  // Create a new comment
  const createComment = useCallback(async (postId: string, content: string) => {
    const store = useSocialStore.getState();
    
    try {
      store.setCommentsLoading(true);

      const createCommentUseCase = container.createComment();
      if (!createCommentUseCase) {
        throw new Error('CreateCommentUseCase not available');
      }

      const input: CreateCommentInput = {
        postId,
        authorId: userId,
        institutionId,
        content
      };

      const result = await createCommentUseCase.execute(input);

      if (result.success && result.comment) {
        // Convert and add comment to store
        const convertedComment = convertCommentWithMetadata({
          comment: result.comment,
          likesCount: 0,
          isLikedByUser: false
        });
        store.addComment(postId, convertedComment);
        onSuccess?.('create', result.comment.id);
        return convertedComment;
      } else {
        const error = result.error || 'Erro ao criar comentário';
        onError?.(error);
        return null;
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      onError?.('Erro inesperado ao criar comentário');
      return null;
    } finally {
      store.setCommentsLoading(false);
    }
  }, [userId, institutionId, onSuccess, onError, container]);

  // Reply to a comment
  const replyToComment = useCallback(async (
    postId: string,
    parentCommentId: string,
    content: string
  ) => {
    const store = useSocialStore.getState();
    
    try {
      store.setCommentsLoading(true);

      const replyToCommentUseCase = container.replyToComment();
      if (!replyToCommentUseCase) {
        throw new Error('ReplyToCommentUseCase not available');
      }

      const input: ReplyToCommentInput = {
        parentCommentId,
        authorId: userId,
        institutionId,
        content
      };

      const result = await replyToCommentUseCase.execute(input);

      if (result.success && result.comment) {
        // Convert and add reply to store
        const convertedComment = convertCommentWithMetadata({
          comment: result.comment,
          likesCount: 0,
          isLikedByUser: false
        });
        store.addComment(postId, convertedComment);
        onSuccess?.('reply', result.comment.id);
        return convertedComment;
      } else {
        const error = result.error || 'Erro ao responder comentário';
        onError?.(error);
        return null;
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
      onError?.('Erro inesperado ao responder comentário');
      return null;
    } finally {
      store.setCommentsLoading(false);
    }
  }, [userId, institutionId, onSuccess, onError, container]);

  // Update a comment (within 24h limit)
  const editComment = useCallback(async (
    postId: string,
    commentId: string,
    content: string
  ) => {
    const store = useSocialStore.getState();
    
    try {
      store.setCommentsLoading(true);

      const updateCommentUseCase = container.updateComment();
      if (!updateCommentUseCase) {
        throw new Error('UpdateCommentUseCase not available');
      }

      const input: UpdateCommentInput = {
        commentId,
        userId,
        content
      };

      const result = await updateCommentUseCase.execute(input);

      if (result.success && result.comment) {
        // Convert and update comment in store
        const convertedComment = convertCommentWithMetadata({
          comment: result.comment,
          likesCount: 0, // Keep existing likes count
          isLikedByUser: false // Keep existing like status
        });
        store.updateComment(postId, commentId, convertedComment);
        onSuccess?.('update', commentId);
        return convertedComment;
      } else {
        const error = result.error || 'Erro ao editar comentário';
        onError?.(error);
        return null;
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      onError?.('Erro inesperado ao editar comentário');
      return null;
    } finally {
      store.setCommentsLoading(false);
    }
  }, [userId, onSuccess, onError, container]);

  // Delete a comment
  const deleteComment = useCallback(async (postId: string, commentId: string) => {
    const store = useSocialStore.getState();
    
    try {
      store.setCommentsLoading(true);

      const deleteCommentUseCase = container.deleteComment();
      if (!deleteCommentUseCase) {
        throw new Error('DeleteCommentUseCase not available');
      }

      const input: DeleteCommentInput = {
        commentId,
        userId
      };

      const result = await deleteCommentUseCase.execute(input);

      if (result.success) {
        // Remove comment from store
        store.removeComment(postId, commentId);
        onSuccess?.('delete', commentId);
        return true;
      } else {
        const error = result.error || 'Erro ao excluir comentário';
        onError?.(error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      onError?.('Erro inesperado ao excluir comentário');
      return false;
    } finally {
      store.setCommentsLoading(false);
    }
  }, [userId, onSuccess, onError, container]);

  // Check if user can edit comment (24h limit)
  const canEditComment = useCallback((comment: SocialComment) => {
    // User must be the author
    if (comment.authorId !== userId) return false;

    // Check 24h limit
    const createdAt = new Date(comment.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
  }, [userId]);

  // Check if user can delete comment
  const canDeleteComment = useCallback((comment: SocialComment) => {
    // User must be the author
    return comment.authorId === userId;
  }, [userId]);

  // Get comments for a specific post
  const getPostComments = useCallback((postId: string) => {
    return comments[postId] || [];
  }, [comments]);

  // Get comment by ID
  const getComment = useCallback((postId: string, commentId: string) => {
    const postComments = comments[postId] || [];
    return postComments.find(comment => comment.id === commentId);
  }, [comments]);

  // Get replies for a comment
  const getCommentReplies = useCallback((postId: string, parentCommentId: string) => {
    const postComments = comments[postId] || [];
    return postComments.filter(comment => comment.parentCommentId === parentCommentId);
  }, [comments]);

  // Get comment statistics
  const getCommentStats = useCallback((postId: string) => {
    const postComments = comments[postId] || [];
    const totalComments = postComments.length;
    const totalLikes = postComments.reduce((sum, comment) => sum + comment.likesCount, 0);
    const userComments = postComments.filter(comment => comment.authorId === userId).length;

    return {
      totalComments,
      totalLikes,
      userComments,
      hasUserCommented: userComments > 0
    };
  }, [comments, userId]);

  return {
    // Data
    comments: getPostComments,
    commentsLoading,
    
    // Actions
    fetchComments,
    createComment,
    replyToComment,
    editComment,
    deleteComment,
    
    // Utilities
    canEditComment,
    canDeleteComment,
    getComment,
    getCommentReplies,
    getCommentStats,
    
    // Refresh
    refreshComments: (postId: string) => fetchComments(postId, true)
  };
}

// Hook for comment form management
export function useCommentForm(postId: string, parentCommentId?: string) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createComment, replyToComment } = useComments({
    userId: 'current-user', // This should come from auth context
    institutionId: 'current-institution', // This should come from auth context
    onSuccess: () => {
      setContent('');
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (parentCommentId) {
      await replyToComment(postId, parentCommentId, content.trim());
    } else {
      await createComment(postId, content.trim());
    }
  }, [content, isSubmitting, postId, parentCommentId, createComment, replyToComment]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return {
    content,
    setContent: handleContentChange,
    isSubmitting,
    handleSubmit,
    canSubmit,
    reset: () => setContent('')
  };
}
