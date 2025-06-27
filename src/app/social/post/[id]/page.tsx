'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePost } from '@/hooks/social/usePosts';
import { useComments } from '@/hooks/social/useComments';
import { useLikes } from '@/hooks/social/useLikes';
import { useProfile } from '@/context/zustand/useProfile';
import { LikeButtonWithTooltip } from '@/components/social/ui/LikeButton';
import { CommentList } from '@/components/social/comment/CommentList';
import { CommentFormWithAvatar } from '@/components/social/comment/CommentForm';

interface PostDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = React.use(params);
  
  // Get real user and institution data
  const { infoUser, infoInstitutions } = useProfile();
  
  // Memoize values to prevent infinite loops
  const userId = useMemo(() => infoUser?.id, [infoUser?.id]);
  const institutionId = useMemo(() => 
    infoInstitutions?.institutions?.idInstitution, 
    [infoInstitutions?.institutions?.idInstitution]
  );
  
  // Get post data
  const { post, loading: postLoading, error: postError } = usePost(id, userId);
  
  // Get comments functionality
  const commentsHook = useComments({
    userId: userId || '',
    institutionId: institutionId || ''
  });

  // Get likes functionality
  const likesHook = useLikes({
    userId: userId || '',
    institutionId: institutionId || ''
  });

  // Get comments for this post
  const comments = commentsHook.comments(id);
  const commentsLoading = commentsHook.commentsLoading;

  // Fetch comments when component mounts
  useEffect(() => {
    if (infoUser?.id && institutionId) {
      commentsHook.fetchComments(id);
    }
  }, [id, infoUser?.id, institutionId]);

  // Handle post like
  const onPostLike = useCallback(async () => {
    if (!post || !infoUser?.id) return;
    
    try {
      await likesHook.handlePostLike(post.id, post.isLikedByUser);
    } catch (error) {
      console.error('Error toggling post like:', error);
    }
  }, [post, infoUser]);

  // Handle comment like
  const onCommentLike = useCallback(async (commentId: string) => {
    if (!infoUser?.id) return;
    
    // Find the comment to get its current like status
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    try {
      await likesHook.handleCommentLike(id, commentId, comment.isLikedByUser);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  }, [id, infoUser, comments]);

  // Handle new comment
  const onCommentSubmit = useCallback(async (content: string) => {
    if (!infoUser?.id || !institutionId) return;
    
    try {
      await commentsHook.createComment(id, content);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }, [id, infoUser, institutionId]);

  // Handle comment reply
  const onCommentReply = useCallback(async (commentId: string, content: string) => {
    if (!infoUser?.id || !institutionId) return;
    
    try {
      await commentsHook.replyToComment(id, commentId, content);
    } catch (error) {
      console.error('Error creating comment reply:', error);
    }
  }, [id, infoUser, institutionId]);

  // Handle comment edit
  const onCommentEdit = useCallback(async (commentId: string, content: string) => {
    if (!infoUser?.id) return;
    
    try {
      await commentsHook.editComment(id, commentId, content);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }, [id, infoUser]);

  // Handle comment delete
  const onCommentDelete = useCallback(async (commentId: string) => {
    if (!infoUser?.id) return;
    
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }
    
    try {
      await commentsHook.deleteComment(id, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [id, infoUser]);

  // Loading state
  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Erro ao carregar post
            </h2>
            <p className="text-red-700 dark:text-red-300">
              {postError || 'Post não encontrado'}
            </p>
            <Link
              href="/social"
              className="inline-flex items-center mt-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              ← Voltar ao feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate reading time
  const getReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min de leitura`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/social"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Feed
          </Link>
        </div>

        {/* Post Content */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {post.author?.name?.charAt(0).toUpperCase() || post.authorId.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {post.author?.name || 'Usuário'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Publicado em {post.createdAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                {/* Edit button for post author */}
                {post.authorId === infoUser?.id && post.status === 'DRAFT' && (
                  <Link
                    href={`/social/edit/${post.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Editar post"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getReadingTime(post.content)}
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  post.status === 'PUBLISHED' ? 'bg-green-500' : 
                  post.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                {post.status === 'PUBLISHED' ? 'Publicado' : 
                 post.status === 'DRAFT' ? 'Rascunho' : 'Arquivado'}
              </span>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Post Interactions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <LikeButtonWithTooltip
                  isLiked={post.isLikedByUser}
                  likesCount={post.likesCount}
                  onLike={onPostLike}
                />
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">{post.commentsCount} comentários</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comentários
            </h2>
          </div>

          {/* Comment Form */}
          {infoUser && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CommentFormWithAvatar
                onSubmit={onCommentSubmit}
                currentUserName={infoUser.name}
              />
            </div>
          )}

          {/* Comments List */}
          <div className="p-6">
            <CommentList
              comments={comments}
              loading={commentsLoading}
              error={null}
              onLike={onCommentLike}
              onReply={onCommentReply}
              onEdit={onCommentEdit}
              onDelete={onCommentDelete}
              currentUserId={infoUser?.id}
              maxLevel={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
