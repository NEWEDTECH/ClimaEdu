'use client';

import { useState, useMemo } from 'react';
import { usePosts } from '@/hooks/social/usePosts';
import { useSocialStore } from '@/context/zustand/useSocialStore';
import { PostCard, PostCardSkeleton } from '@/components/social/post/PostCard';
import { useProfile } from '@/context/zustand/useProfile';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Globe, TrendingUp, Clock, Heart, MessageCircle, Plus, Sparkles, RefreshCw, Edit3 } from 'lucide-react';

export default function SocialPage() {
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get real user and institution data
  const { infoUser, infoInstitutions } = useProfile();
  
  // Memoize values to prevent infinite loops
  const userId = useMemo(() => infoUser?.id, [infoUser?.id]);
  const institutionId = useMemo(() => 
    infoInstitutions?.institutions?.idInstitution, 
    [infoInstitutions?.institutions?.idInstitution]
  );
  
  const { posts, loading, error, refreshPosts } = usePosts({
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

  // Filter posts based on current filter and search
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    switch (filter) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.likesCount - a.likesCount;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Get statistics
  const stats = {
    total: posts.length,
    totalLikes: posts.reduce((sum, post) => sum + post.likesCount, 0),
    totalComments: posts.reduce((sum, post) => sum + post.commentsCount, 0),
    publishedToday: posts.filter(post => {
      const today = new Date();
      const postDate = new Date(post.createdAt);
      return postDate.toDateString() === today.toDateString();
    }).length
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
        {/* Hero Section */}


        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/social/create"
                    className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Criar Post</span>
                    </div>
                  </Link>
                  <Link
                    href="/social/my-posts"
                    className="group px-6 py-3 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border-gray-200/50 text-gray-800 hover:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Meus Posts</span>
                    </div>
                  </Link>
                  <button
                    onClick={refreshPosts}
                    className="group px-6 py-3 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border-gray-200/50 text-gray-800 hover:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Atualizar</span>
                    </div>
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-800">Buscar e Filtrar</h3>
                  </div>
                  
                  {/* Search Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Buscar posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:placeholder-white/50 bg-white/80 border border-gray-200/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        filter === 'all'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Todos
                      </div>
                    </button>
                    <button
                      onClick={() => setFilter('recent')}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        filter === 'recent'
                          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                          : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recentes
                      </div>
                    </button>
                    <button
                      onClick={() => setFilter('popular')}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        filter === 'popular'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                          : 'backdrop-blur-sm dark:bg-white/5 dark:border dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border border-gray-200/50 text-gray-800 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Populares
                      </div>
                    </button>
                  </div>
                </div>

                {/* Error State */}
                {error && (
                  <div className="backdrop-blur-sm rounded-lg p-4 dark:bg-red-500/10 dark:border dark:border-red-500/20 bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="dark:text-red-400 text-red-800 font-medium">
                        Erro ao carregar posts: {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
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
                          <MessageCircle className="w-12 h-12 dark:text-white/60 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-2">
                            {searchQuery ? 'Nenhum post encontrado' : 'Nenhum post ainda'}
                          </h3>
                          <p className="dark:text-white/70 text-gray-600 mb-6">
                            {searchQuery 
                              ? `Não encontramos posts com "${searchQuery}"`
                              : 'Seja o primeiro a compartilhar conhecimento com a comunidade!'
                            }
                          </p>
                          {!searchQuery && (
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
                    // Posts list
                    filteredPosts.map((post) => (
                      <div key={post.id} className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                        <PostCard
                          post={post}
                          onLike={handleLike}
                          onComment={handleComment}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Community Stats */}
                  <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-800">
                        Comunidade
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 dark:text-blue-400 text-blue-600" />
                          <span className="text-sm dark:text-white/80 text-gray-600">Posts</span>
                        </div>
                        <span className="font-medium dark:text-white text-gray-800">{stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 dark:text-red-400 text-red-600" />
                          <span className="text-sm dark:text-white/80 text-gray-600">Total de curtidas</span>
                        </div>
                        <span className="font-medium dark:text-white text-gray-800">{stats.totalLikes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 dark:text-green-400 text-green-600" />
                          <span className="text-sm dark:text-white/80 text-gray-600">Comentários</span>
                        </div>
                        <span className="font-medium dark:text-white text-gray-800">{stats.totalComments}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 dark:text-purple-400 text-purple-600" />
                          <span className="text-sm dark:text-white/80 text-gray-600">Publicados hoje</span>
                        </div>
                        <span className="font-medium dark:text-white text-gray-800">{stats.publishedToday}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-800">
                        Links Rápidos
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Link
                        href="/social/create"
                        className="group flex items-center gap-3 p-3 backdrop-blur-sm rounded-lg dark:bg-white/5 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50 hover:scale-105 transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                        <span className="dark:text-white text-gray-800 font-medium">Criar novo post</span>
                      </Link>
                      <Link
                        href="/social/my-posts"
                        className="group flex items-center gap-3 p-3 backdrop-blur-sm rounded-lg dark:bg-white/5 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50 hover:scale-105 transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        <span className="dark:text-white text-gray-800 font-medium">Meus posts</span>
                      </Link>
                    </div>
                  </div>

                  {/* Trending Topics */}
                  <div className="backdrop-blur-sm rounded-xl dark:bg-blue-500/10 dark:border dark:border-blue-500/20 bg-blue-50/80 border border-blue-200/50 shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold dark:text-blue-100 text-blue-900">
                        Dicas da Comunidade
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="dark:text-blue-200 text-blue-800">
                          Compartilhe experiências práticas e casos reais
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="dark:text-blue-200 text-blue-800">
                          Use títulos claros e descritivos
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="dark:text-blue-200 text-blue-800">
                          Interaja com outros posts através de curtidas e comentários
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="dark:text-blue-200 text-blue-800">
                          Mantenha um tom respeitoso e construtivo
                        </p>
                      </div>
                    </div>
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
