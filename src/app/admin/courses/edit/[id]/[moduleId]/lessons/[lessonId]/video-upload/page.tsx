"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { FormSection } from '@/components/form';
import { LoadingSpinner } from '@/components/loader';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository';
import { showToast } from '@/components/toast';

export default function VideoUploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
  searchParams: Promise<{ contentId?: string }>;
}) {
  const router = useRouter();
  const { id: courseId, moduleId, lessonId } = use(params);
  const { contentId } = use(searchParams);
  const isEditing = !!contentId;

  const [title, setTitle] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [moduleName, setModuleName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        );
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        );

        const [lesson, moduleData] = await Promise.all([
          lessonRepository.findById(lessonId),
          moduleRepository.findById(moduleId),
        ]);

        if (!lesson) {
          setError('Unidade não encontrada');
          setIsLoading(false);
          return;
        }
        if (!moduleData) {
          setError('Módulo não encontrado');
          setIsLoading(false);
          return;
        }

        setLessonTitle(lesson.title);
        setModuleName(moduleData.title);

        if (isEditing && contentId) {
          const contentRepository = container.get<ContentRepository>(
            Register.content.repository.ContentRepository
          );
          const existingContent = await contentRepository.findById(contentId);
          if (existingContent) {
            setTitle(existingContent.title);
            setVideoUrl(existingContent.url);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = 'Falha ao carregar dados';
        setError(errorMessage);
        showToast.error(errorMessage);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, moduleId, contentId, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast.warning('O título do vídeo não pode estar vazio');
      return;
    }
    if (!videoUrl.trim()) {
      showToast.warning('Por favor, insira a URL do vídeo');
      return;
    }

    setIsSaving(true);
    const loadingToastId = showToast.loading(
      isEditing ? 'Atualizando vídeo...' : 'Adicionando vídeo à unidade...'
    );

    try {
      const contentRepository = container.get<ContentRepository>(
        Register.content.repository.ContentRepository
      );
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      );

      if (isEditing && contentId) {
        const existingContent = await contentRepository.findById(contentId);
        if (!existingContent) throw new Error('Vídeo não encontrado');

        existingContent.updateTitle(title);
        existingContent.updateUrl(videoUrl);
        await contentRepository.save(existingContent);

        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) throw new Error('Unidade não encontrada');

        const updatedContents = (lesson.contents || []).map((c) =>
          c.id === contentId
            ? { ...c, title, url: videoUrl }
            : c
        );

        // @ts-expect-error - We're manually updating the contents array
        lesson.contents = updatedContents;
        await lessonRepository.save(lesson);

        showToast.update(loadingToastId, {
          render: 'Vídeo atualizado com sucesso!',
          type: 'success',
        });
      } else {
        const contentId = await contentRepository.generateId();
        const content = Content.create({
          id: contentId,
          lessonId,
          type: ContentType.VIDEO,
          title,
          url: videoUrl,
        });

        const savedContent = await contentRepository.save(content);
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) throw new Error('Unidade não encontrada');

        const contentData = {
          id: savedContent.id,
          lessonId: savedContent.lessonId,
          type: savedContent.type,
          title: savedContent.title,
          url: savedContent.url,
          order: savedContent.order,
        };

        const updatedContents = [...(lesson.contents || []), contentData];

        // @ts-expect-error - We're manually setting the contents array
        lesson.contents = updatedContents;
        await lessonRepository.save(lesson);

        showToast.update(loadingToastId, {
          render: 'Vídeo adicionado com sucesso à unidade!',
          type: 'success',
        });
      }

      setTimeout(() => {
        router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);
      }, 1000);
    } catch (err) {
      console.error('Erro ao salvar vídeo:', err);
      showToast.update(loadingToastId, {
        render: `Falha ao salvar vídeo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                  <Button>Voltar para a Unidade</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Vídeo Aula</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Unidade: <span className="font-medium">{lessonTitle}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Módulo: <span className="font-medium">{moduleName}</span>
                </p>
              </div>
              <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                <Button variant="primary">Voltar</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Vídeo' : 'Novo Vídeo'}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit} className="space-y-6" error={error}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título da Vídeo Aula
                    </label>
                    <InputText
                      id="video-title"
                      placeholder="Digite o título da vídeo aula"
                      value={title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL do Vídeo
                    </label>
                    <InputText
                      id="video-url"
                      placeholder="Cole aqui o link do vídeo (YouTube, Vimeo, etc.)"
                      value={videoUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suporte para YouTube, Vimeo, e outros links de vídeo. Cole o link completo do vídeo.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSaving}>
                    {isSaving
                      ? 'Salvando...'
                      : isEditing
                      ? 'Salvar Alterações'
                      : 'Salvar Vídeo Aula'}
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dicas para Vídeo Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Qualidade de Vídeo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Grave em boa resolução (pelo menos 720p) e em um ambiente bem iluminado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-green-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Áudio Claro</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use um microfone de qualidade e grave em um ambiente silencioso.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-yellow-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Duração Ideal</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mantenha os vídeos entre 5-15 minutos para melhor engajamento dos alunos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-purple-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Estrutura Clara</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comece com uma introdução, desenvolva o conteúdo principal e termine com um resumo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
