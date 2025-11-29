'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePost, usePosts } from '@/hooks/social/usePosts';
import { useFormValidation, postSchema } from '@/components/social/validation/SocialValidation';
import { useProfile } from '@/context/zustand/useProfile';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/button'
import { Edit3, Save, Send, ArrowLeft, AlertTriangle, Clock, History, Sparkles } from 'lucide-react';
import { RichTextEditor } from '@/components/social/RichTextEditor';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  
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
  
  // Get post management functions
  const { updatePost, publishPost } = usePosts({
    userId,
    institutionId,
    autoFetch: false
  });
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form validation
  const { validate, getFieldError } = useFormValidation(postSchema);

  // Initialize form when post loads
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  // Track changes
  useEffect(() => {
    if (post) {
      const hasFormChanges = title !== post.title || content !== post.content;
      setHasChanges(hasFormChanges);
    }
  }, [title, content, post]);

  // Check if user can edit this post
  const canEdit = post && post.authorId === infoUser?.id && post.status === 'DRAFT';

  // Validate form data
  const validateForm = useCallback(() => {
    const formData = {
      title: title.trim(),
      content: content.trim(),
      status: 'draft' as const
    };
    return validate(formData) ? formData : null;
  }, [title, content, validate]);

  // Handle save changes
  const handleSave = useCallback(async () => {
    if (!post || !infoUser?.id || !institutionId) {
      setSubmitError('Dados de usuário ou instituição não encontrados');
      return;
    }

    if (!hasChanges) {
      setSubmitError('Nenhuma alteração foi feita');
      return;
    }

    const formData = validateForm();
    if (!formData) {
      setSubmitError('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const result = await updatePost({
        postId: post.id,
        title: formData.title,
        content: formData.content,
        userId: infoUser.id
      });

      if (result.success) {
        setHasChanges(false);
        router.push('/social/my-posts?tab=drafts');
      } else {
        setSubmitError(result.error || 'Erro ao salvar alterações');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setSubmitError('Erro inesperado ao salvar alterações');
    } finally {
      setIsSubmitting(false);
    }
  }, [post, infoUser, institutionId, hasChanges, validateForm, updatePost, router]);

  // Handle publish post
  const handlePublish = useCallback(async () => {
    if (!post || !infoUser?.id) {
      setSubmitError('Dados de usuário não encontrados');
      return;
    }

    const formData = validateForm();
    if (!formData) {
      setSubmitError('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // First save changes if any
      if (hasChanges) {
        const updateResult = await updatePost({
          postId: post.id,
          title: formData.title,
          content: formData.content,
          userId: infoUser.id
        });

        if (!updateResult.success) {
          setSubmitError(updateResult.error || 'Erro ao salvar alterações');
          return;
        }
      }

      // Then publish
      const publishResult = await publishPost({
        postId: post.id,
        userId: infoUser.id
      });

      if (publishResult.success) {
        router.push('/social');
      } else {
        setSubmitError(publishResult.error || 'Erro ao publicar post');
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      setSubmitError('Erro inesperado ao publicar post');
    } finally {
      setIsSubmitting(false);
    }
  }, [post, infoUser, hasChanges, validateForm, updatePost, publishPost, router]);

  // Handle discard changes
  const handleDiscard = useCallback(() => {
    if (!post) return;
    
    if (hasChanges && !window.confirm('Tem certeza que deseja descartar as alterações?')) {
      return;
    }
    
    setTitle(post.title);
    setContent(post.content);
    setHasChanges(false);
    setSubmitError(null);
  }, [post, hasChanges]);

  // Loading state
  if (postLoading) {
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
  if (postError || !post) {
    return (
      <DashboardLayout>
        <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="backdrop-blur-sm rounded-xl dark:bg-red-500/10 dark:border dark:border-red-500/20 bg-red-50 border border-red-200 shadow-xl p-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center dark:bg-red-500/20 bg-red-100">
                      <AlertTriangle className="w-8 h-8 dark:text-red-400 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold dark:text-red-200 text-red-800 mb-2">
                        Erro ao carregar post
                      </h2>
                      <p className="dark:text-red-300 text-red-700 mb-6">
                        {postError || 'Post não encontrado'}
                      </p>
                      <Link
                        href="/social/my-posts"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar aos meus posts
                      </Link>
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

  // Permission check
  if (!canEdit) {
    return (
      <DashboardLayout>
        <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="backdrop-blur-sm rounded-xl dark:bg-yellow-500/10 dark:border dark:border-yellow-500/20 bg-yellow-50 border border-yellow-200 shadow-xl p-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center dark:bg-yellow-500/20 bg-yellow-100">
                      <AlertTriangle className="w-8 h-8 dark:text-yellow-400 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold dark:text-yellow-200 text-yellow-800 mb-2">
                        Não é possível editar este post
                      </h2>
                      <p className="dark:text-yellow-300 text-yellow-700 mb-6">
                        {post.status !== 'DRAFT' 
                          ? 'Apenas posts em rascunho podem ser editados.'
                          : 'Você não tem permissão para editar este post.'
                        }
                      </p>
                      <Link
                        href="/social/my-posts"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar aos meus posts
                      </Link>
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

  // Check if form is valid
  const isFormValid = title.trim().length >= 5 && content.trim().length >= 10;
  const canSubmit = isFormValid && !isSubmitting && infoUser?.id && institutionId;

  return (
    <DashboardLayout>
      <div className="min-h-screen transition-all duration-300 dark:bg-black bg-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-3xl dark:bg-black bg-gray-200/30"></div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="mb-8">
                <Link
                  href="/social/my-posts"
                  className="inline-flex items-center backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/10 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50 shadow-sm dark:text-white text-gray-800 hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar aos Meus Posts
                </Link>
              </div>

              {/* Header */}
              <div className="text-center space-y-6 mb-12">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                  <h1 className="text-4xl sm:text-5xl font-bold flex items-center space-x-4 dark:text-white text-gray-800">
                    <Edit3 className="w-12 h-12 text-blue-400" />
                    <span>Editar Post</span>
                  </h1>
                  <div className="w-1 h-12 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                </div>
                <p className="text-xl max-w-2xl mx-auto leading-relaxed dark:text-white/80 text-gray-700">
                  Edite seu post e mantenha o conteúdo sempre atualizado
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                  <div className="backdrop-blur-sm rounded-lg px-6 py-3 dark:bg-white/10 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50 shadow-sm">
                    <div className="flex items-center space-x-2 dark:text-white text-gray-800">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Rascunho</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Unsaved Changes Warning */}
            {hasChanges && (
              <div className="backdrop-blur-sm rounded-lg p-4 dark:bg-yellow-500/10 dark:border dark:border-yellow-500/20 bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 dark:text-yellow-400 text-yellow-600" />
                  <p className="dark:text-yellow-200 text-yellow-800 font-medium">
                    Você tem alterações não salvas. Lembre-se de salvar antes de sair.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="backdrop-blur-sm rounded-lg p-4 dark:bg-red-500/10 dark:border dark:border-red-500/20 bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="dark:text-red-400 text-red-800 font-medium">{submitError}</p>
                </div>
              </div>
            )}

            {/* Post Edit Form */}
            <div className="backdrop-blur-sm rounded-xl dark:bg-white/5 dark:border dark:border-white/10 bg-white/90 border border-gray-200/50 shadow-xl">
              <form className="p-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
                {/* Title Input */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                    <label htmlFor="title" className="text-lg font-semibold dark:text-white text-gray-800">
                      Título do Post *
                    </label>
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite um título atrativo que desperte curiosidade..."
                    className={`w-full px-4 py-3 rounded-lg backdrop-blur-sm border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 dark:bg-white/5 dark:border-white/20 dark:text-white dark:placeholder-white/60 bg-white/80 border-gray-200/50 text-gray-800 placeholder-gray-500 ${
                      getFieldError('title') ? 'border-red-500/50 dark:border-red-500/50' : ''
                    }`}
                    maxLength={200}
                    disabled={isSubmitting}
                  />
                  {getFieldError('title') && (
                    <p className="text-sm dark:text-red-400 text-red-600 flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      {getFieldError('title')}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-xs dark:text-white/60 text-gray-500">
                      {title.length}/200 caracteres
                    </p>
                    <div className={`w-2 h-2 rounded-full ${title.length >= 5 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  </div>
                </div>

                {/* Content Editor */}
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  error={getFieldError('content')}
                  disabled={isSubmitting}
                />

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t dark:border-white/10 border-gray-200/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm dark:text-white/80 text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium dark:text-yellow-400 text-yellow-600">Rascunho</span>
                      </div>
                    </div>

                    {hasChanges && (
                      <span className="text-xs dark:text-yellow-400 text-yellow-600 font-medium">
                        • Alterações não salvas
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    {hasChanges && (
                      <Button
                        type="button"
                        variant='secondary'
                        onClick={handleDiscard}
                        disabled={isSubmitting}
                        className="px-4 py-2 dark:text-white/60 text-gray-600 hover:dark:text-white hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Descartar
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSubmit || !hasChanges}
                      className="group px-6 py-3 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border-gray-200/50 text-gray-800 hover:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Salvar Alterações</span>
                          </>
                        )}
                      </div>
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={!canSubmit}
                      className="group px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Publicando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Publicar Post</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Edit History */}
            <div className="backdrop-blur-sm rounded-xl dark:bg-blue-500/10 dark:border dark:border-blue-500/20 bg-blue-50/80 border border-blue-200/50 shadow-lg">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                  <h3 className="text-xl font-bold flex items-center space-x-3 dark:text-blue-100 text-blue-900">
                    <History className="w-6 h-6 text-blue-400" />
                    <span>Histórico de Edições</span>
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 backdrop-blur-sm rounded-lg dark:bg-white/5 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 dark:text-blue-300 text-blue-600" />
                      <span className="text-sm dark:text-blue-200 text-blue-800">
                        Criado em {post.createdAt.toLocaleDateString('pt-BR')} às {post.createdAt.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded dark:bg-blue-500/20 dark:text-blue-300 bg-blue-100 text-blue-700">
                      Original
                    </span>
                  </div>
                  {post.updatedAt && post.updatedAt.getTime() !== post.createdAt.getTime() && (
                    <div className="flex items-center justify-between p-3 backdrop-blur-sm rounded-lg dark:bg-white/5 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50">
                      <div className="flex items-center gap-3">
                        <Edit3 className="w-4 h-4 dark:text-yellow-300 text-yellow-600" />
                        <span className="text-sm dark:text-blue-200 text-blue-800">
                          Última edição em {post.updatedAt.toLocaleDateString('pt-BR')} às {post.updatedAt.toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded dark:bg-yellow-500/20 dark:text-yellow-300 bg-yellow-100 text-yellow-700">
                        Atual
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 backdrop-blur-sm rounded-lg dark:bg-white/5 dark:border dark:border-white/20 bg-white/80 border border-gray-200/50">
                  <p className="text-sm dark:text-blue-300 text-blue-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Lembre-se:</strong> Posts só podem ser editados enquanto estão em rascunho. 
                      Após a publicação, não será mais possível editá-los.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
