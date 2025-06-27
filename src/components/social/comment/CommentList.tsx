'use client';

import React, { useState } from 'react';
import { SocialComment } from '@/context/zustand/useSocialStore';
import { CommentItem, CommentItemSkeleton } from './CommentItem';

interface CommentListProps {
  comments: SocialComment[];
  loading?: boolean;
  error?: string | null;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  maxLevel?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export function CommentList({
  comments,
  loading = false,
  error = null,
  onLike,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  maxLevel = 1,
  showLoadMore = false,
  onLoadMore,
  loadingMore = false
}: CommentListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Sort comments based on selected criteria
  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.likesCount - a.likesCount;
      default:
        return 0;
    }
  });

  // Group comments by parent/child relationship
  const groupedComments = sortedComments.reduce((acc, comment) => {
    if (!comment.parentCommentId) {
      // This is a top-level comment
      acc.push({
        ...comment,
        replies: sortedComments.filter(c => c.parentCommentId === comment.id)
      });
    }
    return acc;
  }, [] as SocialComment[]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 dark:text-red-200 text-sm font-medium">
            Erro ao carregar comentários
          </span>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count and sort options */}
      {(comments.length > 0 || loading) && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {loading ? 'Carregando comentários...' : `${comments.length} comentário${comments.length !== 1 ? 's' : ''}`}
          </h3>
          
          {!loading && comments.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="popular">Mais curtidos</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <CommentItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Comments list */}
      {!loading && (
        <>
          {groupedComments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum comentário ainda
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Seja o primeiro a comentar neste post!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={onLike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  maxLevel={maxLevel}
                />
              ))}
            </div>
          )}

          {/* Load more button */}
          {showLoadMore && (
            <div className="text-center pt-6">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                  </>
                ) : (
                  'Carregar mais comentários'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CommentListCompact({
  comments,
  loading = false,
  maxVisible = 3,
  onViewAll
}: {
  comments: SocialComment[];
  loading?: boolean;
  maxVisible?: number;
  onViewAll?: () => void;
}) {
  const visibleComments = comments.slice(0, maxVisible);
  const hasMore = comments.length > maxVisible;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <CommentItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Nenhum comentário ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          maxLevel={0} // No replies in compact mode
        />
      ))}
      
      {hasMore && (
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Ver todos os {comments.length} comentários
        </button>
      )}
    </div>
  );
}
