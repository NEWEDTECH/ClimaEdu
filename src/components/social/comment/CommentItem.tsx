'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialComment } from '@/context/zustand/useSocialStore';
import { LikeButtonCompact } from '../ui/LikeButton';
import { Button } from '@/components/button'

interface CommentItemProps {
  comment: SocialComment;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
  maxLevel?: number;
}

export function CommentItem({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  level = 0,
  maxLevel = 1
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

  const isOwner = currentUserId === comment.authorId;
  const canReply = level < maxLevel;
  const canEdit = isOwner && isWithin24Hours(comment.createdAt);
  const canDelete = isOwner;

  const timeAgo = formatDistanceToNow(comment.createdAt, {
    addSuffix: true,
    locale: ptBR
  });

  function isWithin24Hours(date: Date): boolean {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  }

  const handleLike = () => {
    onLike?.(comment.id);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(comment.id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      onDelete?.(comment.id);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${level > 0 ? 'ml-8 mt-4' : ''}`}>
      <div 
        className="group relative"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {comment.author?.name?.charAt(0).toUpperCase() || comment.authorId.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Author and Time */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {comment.author?.name || 'Usuário'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo}
              </span>
              {comment.updatedAt > comment.createdAt && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (editado)
                </span>
              )}
            </div>

            {/* Comment Text */}
            {isEditing ? (
              <div className="mb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                  rows={3}
                  maxLength={1000}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {editContent.length}/1000 caracteres
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleEdit}
                      disabled={!editContent.trim() || editContent === comment.content}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300 text-sm mb-3 whitespace-pre-wrap">
                {comment.content}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Like Button */}
              <LikeButtonCompact
                isLiked={comment.isLikedByUser}
                likesCount={comment.likesCount}
                onLike={handleLike}
              />

              {/* Reply Button */}
              {canReply && !isEditing && (
                <Button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Responder
                </Button>
              )}

              {/* Edit/Delete Actions */}
              {(showActions || isEditing) && !isReplying && (
                <div className="flex items-center gap-2">
                  {canEdit && !isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && !isEditing && (
                    <Button
                      onClick={handleDelete}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Excluir
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                  rows={3}
                  maxLength={1000}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {replyContent.length}/1000 caracteres
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                      className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton loader for CommentItem
export function CommentItemSkeleton({ level = 0 }: { level?: number }) {
  return (
    <div className={`${level > 0 ? 'ml-8 mt-4' : ''} animate-pulse`}>
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
        
        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Author and time skeleton */}
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          
          {/* Comment text skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
