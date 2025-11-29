'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePosts } from '@/hooks/social/usePosts';
import { useFormValidation, postSchema } from '@/components/social/validation/SocialValidation';
import { useProfile } from '@/context/zustand/useProfile';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/button'
import {Save, Send, ArrowLeft, Lightbulb } from 'lucide-react';
import { RichTextEditor } from '@/components/social/RichTextEditor';

export default function CreatePostPage() {
  const router = useRouter();
  const { infoUser, infoInstitutions } = useProfile();
  
  // Memoize values to prevent infinite loops
  const userId = useMemo(() => infoUser?.id, [infoUser?.id]);
  const institutionId = useMemo(() => 
    infoInstitutions?.institutions?.idInstitution, 
    [infoInstitutions?.institutions?.idInstitution]
  );
  
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
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
      setIsSavingDraft(true);
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
      setIsSavingDraft(false);
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
      setIsPublishing(true);
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
      setIsPublishing(false);
    }
  }, [infoUser, institutionId, validateForm, createPost, publishPost, router]);

  // Check if form is valid
  const isFormValid = title.trim().length >= 5 && content.trim().length >= 10;
  const isSubmitting = isSavingDraft || isPublishing;
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

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Error Message */}
            {submitError && (
              <div className="backdrop-blur-sm rounded-lg p-4 dark:bg-red-500/10 dark:border dark:border-red-500/20 bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="dark:text-red-400 text-red-800 font-medium">{submitError}</p>
                </div>
              </div>
            )}

            {/* Post Creation Form */}
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm dark:text-white/80 text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium dark:text-yellow-400 text-yellow-600">Rascunho</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={!canSubmit}
                      className="group px-6 py-3 backdrop-blur-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-white/80 border-gray-200/50 text-gray-800 hover:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        {isSavingDraft ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Salvar Rascunho</span>
                          </>
                        )}
                      </div>
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={!canSubmit}
                      className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="flex items-center gap-2">
                        {isPublishing ? (
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

            {/* Writing Tips */}
            <div className="backdrop-blur-sm rounded-xl dark:bg-blue-500/10 dark:border dark:border-blue-500/20 bg-blue-50/80 border border-blue-200/50 shadow-lg">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                  <h3 className="text-xl font-bold flex items-center space-x-3 dark:text-blue-100 text-blue-900">
                    <Lightbulb className="w-6 h-6 text-blue-400" />
                    <span>Dicas para um Post Incrível</span>
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium dark:text-blue-200 text-blue-800">Título Atrativo</p>
                        <p className="text-sm dark:text-blue-300 text-blue-700">Use palavras que despertem curiosidade (mínimo 5 caracteres)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium dark:text-blue-200 text-blue-800">Conteúdo Estruturado</p>
                        <p className="text-sm dark:text-blue-300 text-blue-700">Organize em parágrafos e use markdown (mínimo 10 caracteres)</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium dark:text-blue-200 text-blue-800">Experiências Práticas</p>
                        <p className="text-sm dark:text-blue-300 text-blue-700">Compartilhe casos reais e conhecimentos aplicáveis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium dark:text-blue-200 text-blue-800">Tom Respeitoso</p>
                        <p className="text-sm dark:text-blue-300 text-blue-700">Seja construtivo e inspire discussões saudáveis</p>
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
