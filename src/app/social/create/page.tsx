'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePosts } from '@/hooks/social/usePosts';
import { useFormValidation, postSchema } from '@/components/social/validation/SocialValidation';
import { useProfile } from '@/context/zustand/useProfile';

export default function CreatePostPage() {
  const router = useRouter();
  const { infoUser, infoInstitutions } = useProfile();
  
  // Memoize values to prevent infinite loops
  const userId = useMemo(() => infoUser?.id, [infoUser?.id]);
  const institutionId = useMemo(() => 
    infoInstitutions?.institutions?.idInstitution, 
    [infoInstitutions?.institutions?.idInstitution]
  );
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createPost, publishPost } = usePosts({
    institutionId,
    userId,
    autoFetch: false
  });

  const { validate, getFieldError } = useFormValidation(postSchema);

  // Validate form data
  const validateForm = useCallback(() => {
    const formData = {
      title: title.trim(),
      content: content.trim(),
      status: 'draft' as const
    };
    return validate(formData) ? formData : null;
  }, [title, content, validate]);

  // Handle save as draft
  const handleSaveDraft = useCallback(async () => {
    if (!infoUser?.id || !institutionId) {
      setSubmitError('Usuário ou instituição não identificados');
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

      const result = await createPost({
        title: formData.title,
        content: formData.content,
        authorId: infoUser.id,
        institutionId: institutionId
      });

      if (result.success) {
        router.push('/social/my-posts?tab=drafts');
      } else {
        setSubmitError(result.error || 'Erro ao salvar rascunho');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSubmitError('Erro inesperado ao salvar rascunho');
    } finally {
      setIsSubmitting(false);
    }
  }, [infoUser, institutionId, validateForm, createPost, router]);

  // Handle publish post
  const handlePublish = useCallback(async () => {
    if (!infoUser?.id || !institutionId) {
      setSubmitError('Usuário ou instituição não identificados');
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

      // First create as draft
      const createResult = await createPost({
        title: formData.title,
        content: formData.content,
        authorId: infoUser.id,
        institutionId: institutionId
      });

      if (createResult.success && createResult.post) {
        // Then publish it
        const publishResult = await publishPost({
          postId: createResult.post.id,
          userId: infoUser.id
        });

        if (publishResult.success) {
          router.push('/social');
        } else {
          setSubmitError(publishResult.error || 'Erro ao publicar post');
        }
      } else {
        setSubmitError(createResult.error || 'Erro ao criar post');
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      setSubmitError('Erro inesperado ao publicar post');
    } finally {
      setIsSubmitting(false);
    }
  }, [infoUser, institutionId, validateForm, createPost, publishPost, router]);

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
              href="/social"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao Feed
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Criar Novo Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compartilhe seu conhecimento com a comunidade educacional
          </p>
        </div>

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

        {/* Post Creation Form */}
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Status: Rascunho
                </span>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!canSubmit}
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
                    'Salvar Rascunho'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

        {/* Writing Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            Dicas para um bom post
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Use um título claro e descritivo (mínimo 5 caracteres)
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Organize o conteúdo em parágrafos (mínimo 10 caracteres)
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Compartilhe experiências e conhecimentos práticos
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Seja respeitoso e construtivo
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
