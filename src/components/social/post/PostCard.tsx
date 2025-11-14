'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialPost } from '@/context/zustand/useSocialStore';
import { Button } from '@/components/button'

interface PostCardProps {
  post: SocialPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function PostCard({ 
  post, 
  onLike, 
  onComment, 
  showActions = true, 
  compact = false 
}: PostCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComment?.(post.id);
  };

  // Truncate content for preview
  const getPreviewContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Calculate reading time (rough estimate: 200 words per minute)
  const getReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min de leitura`;
  };

  const timeAgo = formatDistanceToNow(post.createdAt, {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <article className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${compact ? 'p-4' : 'p-6'}`}>
      <Link href={`/social/post/${post.id}`} className="block">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {post.author?.name?.charAt(0).toUpperCase() || post.authorId.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {post.author?.name || 'Usuário'}
              </h3>
              {post.status === 'PUBLISHED' && (
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{getReadingTime(post.content)}</span>
              {post.status !== 'PUBLISHED' && (
                <>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'DRAFT' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {post.status === 'DRAFT' ? 'Rascunho' : 'Arquivado'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h2 className={`font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${compact ? 'text-lg' : 'text-xl'}`}>
            {post.title}
          </h2>
          
          <div className={`text-gray-600 dark:text-gray-300 line-clamp-3 ${compact ? 'text-sm' : 'text-base'}`}>
            {getPreviewContent(post.content)}
          </div>
        </div>

        {/* Post Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {/* Like Button */}
              <Button
                onClick={handleLike}
                variant="ghost"
                className={`flex flex-col items-center gap-1 text-xs transition-colors w-auto px-3 ${
                  post.isLikedByUser
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <svg 
                  className={`w-5 h-5 ${post.isLikedByUser ? 'fill-current' : ''}`} 
                  fill={post.isLikedByUser ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                <span>{post.likesCount}</span>
              </Button>

              {/* Comment Button */}
              <Button
                onClick={handleComment}
                variant="ghost"
                className="flex flex-col items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-auto px-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
                <span>{post.commentsCount}</span>
              </Button>

              {/* Share Button */}
              <Button 
                variant="ghost"
                className="flex flex-col items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors w-auto px-3"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
                  />
                </svg>
                <span className="text-center">Compartilhar</span>
              </Button>
            </div>

            {/* Read More */}
            <div className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Ler mais →
            </div>
          </div>
        )}
      </Link>
    </article>
  );
}

// Skeleton loader for PostCard
export function PostCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse ${compact ? 'p-4' : 'p-6'}`}>
      {/* Author skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mb-4">
        <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 ${compact ? 'h-5' : 'h-6'}`}></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
}
