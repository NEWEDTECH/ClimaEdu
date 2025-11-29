'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePost } from '@/hooks/social/usePosts';
import { useProfile } from '@/context/zustand/useProfile';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/button';
import { ArrowLeft, Heart, MessageCircle, Share2, Edit, Trash2 } from 'lucide-react';

interface PostDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { infoUser } = useProfile();

  // Memoize userId
  const userId = useMemo(() => infoUser?.id, [infoUser?.id]);

  // Get post data
  const { post, loading, error } = usePost(id, userId);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="animate-pulse space-y-8">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-xl p-8 space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <DashboardLayout>
        <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="backdrop-blur-sm rounded-xl dark:bg-red-500/10 dark:border dark:border-red-500/20 bg-red-50 border border-red-200 shadow-xl p-8">
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold dark:text-red-200 text-red-800 mb-2">
                      Post não encontrado
                    </h2>
                    <p className="dark:text-red-300 text-red-700 mb-6">
                      {error || 'O post que você está procurando não existe ou foi removido.'}
                    </p>
                    <Link
                      href="/social"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Voltar ao Feed
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const timeAgo = formatDistanceToNow(post.createdAt, {
    addSuffix: true,
    locale: ptBR
  });

  const isAuthor = post.authorId === userId;

  return (
    <DashboardLayout>
      <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="mb-8">
                <Link
                  href="/social"
                  className="inline-flex items-center backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/10 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50 shadow-sm dark:text-white text-gray-800 hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar ao Feed
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Post Card */}
            <article className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-xl p-8">
              {/* Author Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {post.author?.name?.charAt(0).toUpperCase() || post.authorId.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {post.author?.name || 'Usuário'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{timeAgo}</span>
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

                {/* Actions for author */}
                {isAuthor && post.status === 'DRAFT' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/social/edit/${post.id}`)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar post"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {post.title}
              </h1>

              {/* Content */}
              <div 
                className="ql-editor text-gray-600 dark:text-gray-300 text-base prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Stats & Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-6">
                  {/* Like */}
                  <div className="flex items-center gap-2">
                    <Heart className={`w-5 h-5 ${post.isLikedByUser ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{post.likesCount}</span>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{post.commentsCount}</span>
                  </div>
                </div>

                {/* Share */}
                <Button
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Compartilhar</span>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
