'use client';

import { useCallback, useEffect } from 'react';
import { useSocialStore, type SocialPost } from '@/context/zustand/useSocialStore';
import { useSocialContainer } from './useContainer';

// Import types from social module
import type { PostWithMetadata } from '@/_core/modules/social/core/use-cases/post/list-posts.output';
import type { PostWithFullMetadata } from '@/_core/modules/social/core/use-cases/post/get-post.output';
import type { ListPostsInput } from '@/_core/modules/social/core/use-cases/post/list-posts.input';
import type { GetPostInput } from '@/_core/modules/social/core/use-cases/post/get-post.input';
import type { CreatePostInput } from '@/_core/modules/social/core/use-cases/post/create-post.input';
import type { UpdatePostInput } from '@/_core/modules/social/core/use-cases/post/update-post.input';
import type { PublishPostInput } from '@/_core/modules/social/core/use-cases/post/publish-post.input';

// Helper function to convert backend post data to frontend format
function convertPostWithMetadata(postData: PostWithMetadata): SocialPost {
  const { post, likesCount, isLikedByUser, commentsCount } = postData;
  
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    institutionId: post.institutionId,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    likesCount,
    commentsCount,
    isLikedByUser,
    // TODO: Add author info when available
    author: undefined
  };
}

export interface UsePostsOptions {
  institutionId?: string;
  userId?: string;
  autoFetch?: boolean;
  cacheTime?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const {
    institutionId,
    userId,
    autoFetch = true,
    cacheTime = 5 * 60 * 1000 // 5 minutes
  } = options;

  const {
    posts,
    postsLoading,
    postsError
  } = useSocialStore();

  const container = useSocialContainer();

  // Fetch published posts for the feed
  const fetchPosts = useCallback(async (force = false) => {
    if (!institutionId || !userId) return;

    const store = useSocialStore.getState();
    const cacheKey = `posts-${institutionId}`;
    
    // Check cache validity
    if (!force && store.isCacheValid(cacheKey, cacheTime)) {
      return;
    }

    try {
      store.setPostsLoading(true);
      store.setPostsError(null);

      const listPostsUseCase = container.listPosts();
      if (!listPostsUseCase) {
        throw new Error('ListPostsUseCase not available');
      }

      const input: ListPostsInput = {
        institutionId,
        userId,
        limit: 20
      };

      const result = await listPostsUseCase.execute(input);

      if (result.success && result.posts) {
        const convertedPosts = result.posts.map(convertPostWithMetadata);
        store.setPosts(convertedPosts);
        store.updateLastFetchTime(cacheKey);
      } else {
        store.setPostsError(result.error || 'Erro ao carregar posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      store.setPostsError('Erro inesperado ao carregar posts');
    } finally {
      store.setPostsLoading(false);
    }
  }, [institutionId, userId, cacheTime, container]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch && institutionId && userId) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, institutionId, userId]);

  // Refresh posts (force fetch)
  const refreshPosts = useCallback(() => {
    return fetchPosts(true);
  }, [fetchPosts]);

  // Create new post
  const createPost = useCallback(async (input: CreatePostInput) => {
    const store = useSocialStore.getState();
    
    try {
      store.setPostsLoading(true);
      store.setPostsError(null);

      const createPostUseCase = container.createPost();
      if (!createPostUseCase) {
        throw new Error('CreatePostUseCase not available');
      }

      const result = await createPostUseCase.execute(input);

      if (result.success) {
        // Refresh posts to include the new one
        await fetchPosts(true);
        return result;
      } else {
        store.setPostsError(result.error || 'Erro ao criar post');
        return result;
      }
    } catch (error) {
      console.error('Error creating post:', error);
      store.setPostsError('Erro inesperado ao criar post');
      return { success: false, error: 'Erro inesperado ao criar post' };
    } finally {
      store.setPostsLoading(false);
    }
  }, [container, fetchPosts]);

  // Update post
  const updatePost = useCallback(async (input: UpdatePostInput) => {
    const store = useSocialStore.getState();
    
    try {
      store.setPostsLoading(true);
      store.setPostsError(null);

      const updatePostUseCase = container.updatePost();
      if (!updatePostUseCase) {
        throw new Error('UpdatePostUseCase not available');
      }

      const result = await updatePostUseCase.execute(input);

      if (result.success) {
        // Refresh posts to reflect changes
        await fetchPosts(true);
        return result;
      } else {
        store.setPostsError(result.error || 'Erro ao atualizar post');
        return result;
      }
    } catch (error) {
      console.error('Error updating post:', error);
      store.setPostsError('Erro inesperado ao atualizar post');
      return { success: false, error: 'Erro inesperado ao atualizar post' };
    } finally {
      store.setPostsLoading(false);
    }
  }, [container, fetchPosts]);

  // Publish post
  const publishPost = useCallback(async (input: PublishPostInput) => {
    const store = useSocialStore.getState();
    
    try {
      store.setPostsLoading(true);
      store.setPostsError(null);

      const publishPostUseCase = container.publishPost();
      if (!publishPostUseCase) {
        throw new Error('PublishPostUseCase not available');
      }

      const result = await publishPostUseCase.execute(input);

      if (result.success) {
        // Refresh posts to reflect changes
        await fetchPosts(true);
        return result;
      } else {
        store.setPostsError(result.error || 'Erro ao publicar post');
        return result;
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      store.setPostsError('Erro inesperado ao publicar post');
      return { success: false, error: 'Erro inesperado ao publicar post' };
    } finally {
      store.setPostsLoading(false);
    }
  }, [container, fetchPosts]);

  return {
    posts,
    loading: postsLoading,
    error: postsError,
    fetchPosts,
    refreshPosts,
    createPost,
    updatePost,
    publishPost,
    isEmpty: posts.length === 0 && !postsLoading
  };
}

// Hook for user's own posts (simplified version for now)
export function useMyPosts(options: UsePostsOptions = {}) {
  const {
    institutionId,
    userId,
    autoFetch = true,
    cacheTime = 5 * 60 * 1000
  } = options;

  const {
    myPosts,
    postsLoading,
    postsError
  } = useSocialStore();

  const container = useSocialContainer();

  // For now, use the same ListPostsUseCase but filter by user
  const fetchMyPosts = useCallback(async (force = false) => {
    if (!institutionId || !userId) return;

    const store = useSocialStore.getState();
    const cacheKey = `my-posts-${userId}-${institutionId}`;
    
    if (!force && store.isCacheValid(cacheKey, cacheTime)) {
      return;
    }

    try {
      store.setPostsLoading(true);
      store.setPostsError(null);

      const listPostsUseCase = container.listPosts();
      if (!listPostsUseCase) {
        throw new Error('ListPostsUseCase not available');
      }

      const input: ListPostsInput = {
        institutionId,
        userId,
        limit: 50
      };

      const result = await listPostsUseCase.execute(input);

      if (result.success && result.posts) {
        // Filter posts by current user (temporary solution)
        const userPosts = result.posts.filter(p => p.post.authorId === userId);
        const convertedPosts = userPosts.map(convertPostWithMetadata);
        store.setMyPosts(convertedPosts);
        store.updateLastFetchTime(cacheKey);
      } else {
        store.setPostsError(result.error || 'Erro ao carregar seus posts');
      }
    } catch (error) {
      console.error('Error fetching my posts:', error);
      store.setPostsError('Erro inesperado ao carregar seus posts');
    } finally {
      store.setPostsLoading(false);
    }
  }, [institutionId, userId, cacheTime, container]);

  useEffect(() => {
    if (autoFetch && institutionId && userId) {
      fetchMyPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, institutionId, userId]);

  const refreshMyPosts = useCallback(() => {
    return fetchMyPosts(true);
  }, [fetchMyPosts]);

  return {
    posts: myPosts,
    loading: postsLoading,
    error: postsError,
    fetchMyPosts,
    refreshMyPosts,
    isEmpty: myPosts.length === 0 && !postsLoading
  };
}

// Helper function to convert GetPost result to frontend format
function convertPostWithFullMetadata(postData: PostWithFullMetadata): SocialPost {
  const { post, likesCount, isLikedByUser, commentsCount } = postData;
  
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    institutionId: post.institutionId,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    likesCount,
    commentsCount,
    isLikedByUser,
    // TODO: Add author info when available
    author: undefined
  };
}

// Enhanced single post hook using GetPostUseCase
export function usePost(postId: string, userId?: string) {
  const { 
    currentPost, 
    postsLoading, 
    postsError,
    setCurrentPost
  } = useSocialStore();

  const container = useSocialContainer();

  // Fetch single post with full metadata
  const fetchPost = useCallback(async (force = false) => {
    if (!postId || !userId) return;

    const cacheKey = `post-${postId}`;
    const store = useSocialStore.getState();
    
    if (!force && store.isCacheValid(cacheKey, 5 * 60 * 1000)) {
      return;
    }

    try {
      store.setPostsLoading(true);
      store.setPostsError(null);

      const getPostUseCase = container.getPost();
      if (!getPostUseCase) {
        throw new Error('GetPostUseCase not available');
      }

      const input: GetPostInput = {
        postId,
        userId
      };

      const result = await getPostUseCase.execute(input);

      if (result.success && result.postData) {
        const convertedPost = convertPostWithFullMetadata(result.postData);
        store.setCurrentPost(convertedPost);
        store.updateLastFetchTime(cacheKey);
      } else {
        store.setPostsError(result.error || 'Post não encontrado');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      store.setPostsError('Erro inesperado ao carregar post');
    } finally {
      store.setPostsLoading(false);
    }
  }, [postId, userId, container]);

  // Auto-fetch when postId or userId changes
  useEffect(() => {
    if (postId && userId) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, userId]);

  const refreshPost = useCallback(() => {
    return fetchPost(true);
  }, [fetchPost]);

  const clearPost = useCallback(() => {
    setCurrentPost(null);
  }, [setCurrentPost]);

  // Check if this is the current post being viewed
  const isCurrentPost = currentPost?.id === postId;

  return {
    post: isCurrentPost ? currentPost : null,
    loading: postsLoading,
    error: postsError,
    fetchPost,
    refreshPost,
    clearPost,
    isNotFound: !postsLoading && !currentPost && postId !== undefined
  };
}

// Hook for post statistics and metadata
export function usePostStats(postId: string) {
  const { posts, myPosts, currentPost } = useSocialStore();

  // Find post in any of the arrays
  const post = posts.find(p => p.id === postId) || 
               myPosts.find(p => p.id === postId) || 
               (currentPost?.id === postId ? currentPost : null);

  return {
    post,
    likesCount: post?.likesCount || 0,
    commentsCount: post?.commentsCount || 0,
    isLikedByUser: post?.isLikedByUser || false,
    status: post?.status,
    createdAt: post?.createdAt,
    updatedAt: post?.updatedAt,
    publishedAt: post?.publishedAt,
    author: post?.author
  };
}
