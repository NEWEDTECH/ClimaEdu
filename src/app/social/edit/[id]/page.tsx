'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePost, usePosts } from '@/hooks/social/usePosts';
import { useFormValidation, postSchema } from '@/components/social/validation/SocialValidation';
import { useProfile } from '@/context/zustand/useProfile';

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
        // Show success message or redirect
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
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
              href="/social/my-posts"
              className="inline-flex items-center mt-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              ← Voltar aos meus posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Permission check
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Não é possível editar este post
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              {post.status !== 'DRAFT' 
                ? 'Apenas posts em rascunho podem ser editados.'
                : 'Você não tem permissão para editar este post.'
              }
            </p>
            <Link
              href="/social/my-posts"
              className="inline-flex items-center mt-4 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
            >
              ← Voltar aos meus posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if form is valid
  const isFormValid = title.trim().length >= 5 && content.trim().length >= 10;
  const canSubmit = isFormValid && !isSubmitting && infoUser?.id && institutionId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/social/my-posts"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar aos Meus Posts
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Editar Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Edite seu post e mantenha o conteúdo atualizado
          </p>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Você tem alterações não salvas. Lembre-se de salvar antes de sair.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          </div>
        )}

        {/* Post Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título do Post *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite um título atrativo para seu post..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  getFieldError('title') ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                maxLength={200}
                disabled={isSubmitting}
              />
              {getFieldError('title') && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {getFieldError('title')}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {title.length}/200 caracteres
              </p>
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo *
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do seu post aqui... Você pode usar markdown para formatação."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-vertical ${
                  getFieldError('content') ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                maxLength={50000}
                disabled={isSubmitting}
              />
              {getFieldError('content') && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {getFieldError('content')}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {content.length}/50.000 caracteres. Suporte a Markdown disponível.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Status: Rascunho
                  </span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Post ID: {id}
                </span>
                {hasChanges && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    • Alterações não salvas
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Descartar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSubmit || !hasChanges}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Publicando...
                    </>
                  ) : (
                    'Publicar Post'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Edit History */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            Histórico de Edições
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span>Criado em {post.createdAt.toLocaleDateString('pt-BR')} às {post.createdAt.toLocaleTimeString('pt-BR')}</span>
              <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">Original</span>
            </div>
            {post.updatedAt && post.updatedAt.getTime() !== post.createdAt.getTime() && (
              <div className="flex items-center justify-between">
                <span>Última edição em {post.updatedAt.toLocaleDateString('pt-BR')} às {post.updatedAt.toLocaleTimeString('pt-BR')}</span>
                <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">Atual</span>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
            💡 Lembre-se: Posts só podem ser editados enquanto estão em rascunho. 
            Após a publicação, não será mais possível editá-los.
          </p>
        </div>
      </div>
    </div>
  );
}
