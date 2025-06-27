'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMyPosts } from '@/hooks/social/usePosts';
import { PostCard, PostCardSkeleton } from '@/components/social/post/PostCard';
import { useSocialStore } from '@/context/zustand/useSocialStore';
import { useProfile } from '@/context/zustand/useProfile';

type PostStatus = 'all' | 'published' | 'draft' | 'archived';

export default function MyPostsPage() {
  const [statusFilter, setStatusFilter] = useState<PostStatus>('all');
  
  // Get real user and institution data
  const { infoUser, infoInstitutions } = useProfile();
  
  // Memoize values to prevent infinite loops
  const userId = useMemo(() => infoUser?.id, [infoUser?.id]);
  const institutionId = useMemo(() => 
    infoInstitutions?.institutions?.idInstitution, 
    [infoInstitutions?.institutions?.idInstitution]
  );

  const { posts, loading, error, refreshMyPosts } = useMyPosts({
    userId,
    institutionId,
    autoFetch: true
  });

  const { togglePostLike } = useSocialStore();

  const handleLike = (postId: string) => {
    togglePostLike(postId);
    // In real implementation, this would also call the backend
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail page
    window.location.href = `/social/post/${postId}`;
  };

  const handleEdit = (postId: string) => {
    window.location.href = `/social/edit/${postId}`;
  };

  const handlePublish = (postId: string) => {
    console.log('Publish post:', postId);
    // In real implementation, this would call the backend to publish the post
  };

  const handleArchive = (postId: string) => {
    console.log('Archive post:', postId);
    // In real implementation, this would call the backend to archive the post
  };

  const handleDelete = (postId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      console.log('Delete post:', postId);
      // In real implementation, this would call the backend to delete the post
    }
  };

  // Filter posts based on status
  const filteredPosts = posts.filter(post => {
    switch (statusFilter) {
      case 'published':
        return post.status === 'PUBLISHED';
      case 'draft':
        return post.status === 'DRAFT';
      case 'archived':
        return post.status === 'ARCHIVED';
      default:
        return true;
    }
  });

  // Count posts by status
  const statusCounts = {
    all: posts.length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
    draft: posts.filter(p => p.status === 'DRAFT').length,
    archived: posts.filter(p => p.status === 'ARCHIVED').length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Meus Posts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie seus posts publicados e rascunhos
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshMyPosts}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
              <Link
                href="/social/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Post
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Todos ({statusCounts.all})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === 'published'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Publicados ({statusCounts.published})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === 'draft'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Rascunhos ({statusCounts.draft})
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === 'archived'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Arquivados ({statusCounts.archived})
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 dark:text-red-200 text-sm font-medium">
                Erro ao carregar posts
              </span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
              {error}
            </p>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))
          ) : filteredPosts.length === 0 ? (
            // Empty state
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {statusFilter === 'all' 
                    ? 'Nenhum post encontrado'
                    : `Nenhum post ${
                        statusFilter === 'published' ? 'publicado' :
                        statusFilter === 'draft' ? 'em rascunho' : 'arquivado'
                      } encontrado`
                  }
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {statusFilter === 'all'
                    ? 'Você ainda não criou nenhum post. Comece compartilhando seu conhecimento!'
                    : `Você não tem posts ${
                        statusFilter === 'published' ? 'publicados' :
                        statusFilter === 'draft' ? 'em rascunho' : 'arquivados'
                      } no momento.`
                  }
                </p>
                {statusFilter === 'all' && (
                  <Link
                    href="/social/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar meu primeiro post
                  </Link>
                )}
              </div>
            </div>
          ) : (
            // Posts list with enhanced actions
            filteredPosts.map((post) => (
              <div key={post.id} className="relative">
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                />
                
                {/* Enhanced Actions Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.status === 'DRAFT' && (
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Continuar editando"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {post.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      title="Publicar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  )}
                  
                  {post.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleArchive(post.id)}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                      title="Arquivar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics Summary */}
        {!loading && posts.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumo dos seus posts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {posts.reduce((sum, post) => sum + post.likesCount, 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total de curtidas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {posts.reduce((sum, post) => sum + post.commentsCount, 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total de comentários
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {statusCounts.published}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Posts publicados
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statusCounts.draft}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Rascunhos
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
