'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMyPosts } from '@/hooks/social/usePosts';
import { PostCard, PostCardSkeleton } from '@/components/social/post/PostCard';
import { useSocialStore } from '@/context/zustand/useSocialStore';
import { useProfile } from '@/context/zustand/useProfile';
import { DashboardLayout } from '@/components/layout';
import { Button } from "@/components/button"
import { FileText, Edit3, Send, Archive, Trash2, ArrowLeft, BarChart3, Plus } from 'lucide-react';

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

  // Calculate statistics
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
  
  const stats = {
    totalLikes,
    totalComments,
    totalViews: 0, // Placeholder since viewsCount doesn't exist in SocialPost
    avgEngagement: posts.length > 0 ? Math.round((totalLikes + totalComments) / posts.length) : 0
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto">
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

              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <div className="text-center lg:text-left space-y-6">
                  <div className="flex items-center justify-center lg:justify-start space-x-3">
                    <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                    <h1 className="text-4xl sm:text-5xl font-bold flex items-center space-x-4 dark:text-white text-gray-800">
                      <FileText className="w-12 h-12 text-blue-400" />
                      <span>Meus Posts</span>
                    </h1>
                    <div className="w-1 h-12 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                  </div>
                 
                </div>

                <div className="hidden lg:flex gap-4">
                  <Button
                    onClick={refreshMyPosts}
                    className="group px-6 py-3 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border-gray-200/50 text-gray-800 hover:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Atualizar</span>
                    </div>
                  </Button>
                  <Link
                    href="/social/create"
                    className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Novo Post</span>
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Mobile Actions */}
            <div className="lg:hidden flex gap-4">
              <Button
                onClick={refreshMyPosts}
                className="flex-1 group px-4 py-3 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border-gray-200/50 text-gray-800 hover:bg-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Atualizar</span>
                </div>
              </Button>
              <Link
                href="/social/create"
                className="flex-1 group px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Novo Post</span>
                </div>
              </Link>
            </div>

            {/* Filters */}
            <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                <h3 className="text-lg font-semibold dark:text-white text-gray-800">Filtrar Posts</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                  }`}
                >
                  Todos ({statusCounts.all})
                </Button>
                <Button
                  onClick={() => setStatusFilter('published')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    statusFilter === 'published'
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                      : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Publicados ({statusCounts.published})
                  </div>
                </Button>
                <Button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    statusFilter === 'draft'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                      : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Rascunhos ({statusCounts.draft})
                  </div>
                </Button>
                <Button
                  onClick={() => setStatusFilter('archived')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    statusFilter === 'archived'
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                      : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    Arquivados ({statusCounts.archived})
                  </div>
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="backdrop-blur-sm rounded-lg p-4 dark:bg-red-500/10 dark:border dark:border-red-500/20 bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="dark:text-red-400 text-red-800 font-medium">Erro ao carregar posts: {error}</p>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {loading ? (
                // Loading skeletons
                [...Array(3)].map((_, i) => (
                  <div key={i} className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg">
                    <PostCardSkeleton />
                  </div>
                ))
              ) : filteredPosts.length === 0 ? (
                // Empty state
                <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg p-12">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center dark:bg-white/10 bg-gray-100">
                      <FileText className="w-12 h-12 dark:text-white/60 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-2">
                        {statusFilter === 'all' 
                          ? 'Nenhum post encontrado'
                          : `Nenhum post ${
                              statusFilter === 'published' ? 'publicado' :
                              statusFilter === 'draft' ? 'em rascunho' : 'arquivado'
                            } encontrado`
                        }
                      </h3>
                      <p className="dark:text-white/70 text-gray-600 mb-6">
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
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Criar meu primeiro post
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Posts list with enhanced actions
                filteredPosts.map((post) => (
                  <div key={post.id} className="group relative backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                    />
                    
                    {/* Enhanced Actions Overlay */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {post.status === 'DRAFT' && (
                        <Button
                          onClick={() => handleEdit(post.id)}
                          className="p-2 backdrop-blur-sm rounded-lg dark:bg-blue-500/20 dark:border dark:border-blue-500/30 bg-blue-50 border border-blue-200 text-blue-600 hover:scale-110 transition-all duration-200"
                          title="Continuar editando"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {post.status === 'DRAFT' && (
                        <Button
                          onClick={() => handlePublish(post.id)}
                          className="p-2 backdrop-blur-sm rounded-lg dark:bg-green-500/20 dark:border dark:border-green-500/30 bg-green-50 border border-green-200 text-green-600 hover:scale-110 transition-all duration-200"
                          title="Publicar"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {post.status === 'PUBLISHED' && (
                        <Button
                          onClick={() => handleArchive(post.id)}
                          className="p-2 backdrop-blur-sm rounded-lg dark:bg-yellow-500/20 dark:border dark:border-yellow-500/30 bg-yellow-50 border border-yellow-200 text-yellow-600 hover:scale-110 transition-all duration-200"
                          title="Arquivar"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 backdrop-blur-sm rounded-lg dark:bg-red-500/20 dark:border dark:border-red-500/30 bg-red-50 border border-red-200 text-red-600 hover:scale-110 transition-all duration-200"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Statistics Summary */}
            {!loading && posts.length > 0 && (
              <div className="backdrop-blur-sm rounded-xl dark:bg-blue-500/10 dark:border dark:border-blue-500/20 bg-blue-50/80 border border-blue-200/50 shadow-lg">
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                    <h3 className="text-xl font-bold flex items-center space-x-3 dark:text-blue-100 text-blue-900">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                      <span>Resumo dos seus Posts</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold dark:text-blue-200 text-blue-800 mb-1">
                        {stats.totalLikes}
                      </div>
                      <div className="text-sm dark:text-blue-300 text-blue-700">
                        Total de curtidas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold dark:text-green-200 text-green-800 mb-1">
                        {stats.totalComments}
                      </div>
                      <div className="text-sm dark:text-green-300 text-green-700">
                        Total de comentários
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold dark:text-purple-200 text-purple-800 mb-1">
                        {statusCounts.published}
                      </div>
                      <div className="text-sm dark:text-purple-300 text-purple-700">
                        Posts publicados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold dark:text-yellow-200 text-yellow-800 mb-1">
                        {statusCounts.draft}
                      </div>
                      <div className="text-sm dark:text-yellow-300 text-yellow-700">
                        Rascunhos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
