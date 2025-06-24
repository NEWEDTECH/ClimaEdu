"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { InputMedia } from '@/components/ui/input/input-media/InputMedia';
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
import { storage } from '@/_core/shared/firebase/firebase-client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function VideoUploadPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }>}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: courseId, moduleId, lessonId } = unwrappedParams;
  
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
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
        
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
          setError('Lição não encontrada');
          setIsLoading(false);
          return;
        }
        
        setLessonTitle(lesson.title);
        
        const moduleData = await moduleRepository.findById(moduleId);
        if (!moduleData) {
          setError('Módulo não encontrado');
          setIsLoading(false);
          return;
        }
        
        setModuleName(moduleData.title);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Falha ao carregar dados');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  const uploadVideoToFirebase = (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: () => void
  ) => {
    setIsUploading(true);
    
    const storageRef = ref(storage, `videos/${courseId}/${moduleId}/${lessonId}/${Date.now()}_${file.name}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
    
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Error uploading video:', error);
        setIsUploading(false);
        alert('Falha ao fazer upload do vídeo. Por favor, tente novamente.');
      },
      async () => {

        try {

          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setVideoUrl(downloadURL);
          setIsUploading(false);
          setUploadComplete(true);
          onComplete();
        } catch (error) {
          console.error('Error getting download URL:', error);
          setIsUploading(false);
          alert('Falha ao obter URL do vídeo. Por favor, tente novamente.');
        }
      }
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('O título do vídeo não pode estar vazio');
      return;
    }
    
    if (!videoUrl) {
      alert('Por favor, faça upload de um vídeo');
      return;
    }
    
    setIsSaving(true);
    
    try {

      const contentRepository = container.get<ContentRepository>(
        Register.content.repository.ContentRepository
      );
      
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      );
      

      const contentId = await contentRepository.generateId();
      
      const content = Content.create({
        id: contentId,
        lessonId: lessonId,
        type: ContentType.VIDEO,
        title,
        url: videoUrl
      });
      

      const savedContent = await contentRepository.save(content);

      const lesson = await lessonRepository.findById(lessonId);
      
      if (!lesson) {
        throw new Error('Lição não encontrada');
      }
      
      const contentData = {
        id: savedContent.id,
        lessonId: savedContent.lessonId,
        type: savedContent.type,
        title: savedContent.title,
        url: savedContent.url
      };
      
      const currentContents = lesson.contents || [];
      
      const updatedContents = [...currentContents, contentData];
      
      // @ts-expect-error - We're manually setting the contents array
      lesson.contents = updatedContents;
      
      await lessonRepository.save(lesson);
      
      console.log('Vídeo adicionado com sucesso à lição');
      
      router.push(`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      alert(`Falha ao adicionar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };


  const handleCancel = () => {
    router.push(`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
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
                <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                  <Button>Voltar para a Lição</Button>
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
            <h1 className="text-2xl font-bold mb-2">Upload de Vídeo Aula</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Adicionar vídeo à lição: <span className="font-medium">{lessonTitle}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Módulo: <span className="font-medium">{moduleName}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Novo Vídeo</CardTitle>
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
                      Descrição
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[100px]"
                      placeholder="Digite uma descrição para a vídeo aula"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className='flex flex-col items-center'>
                    <label className="block text-sm font-medium mb-1">
                      Vídeo
                    </label>
                    <div className="max-w-xl">
                      <InputMedia
                        aspect="16:9"
                        allowedExtensions="mp4,webm,mov"
                        maxFileSizeMB={500}
                        maxDurationSeconds={3600} // 1 hour max
                        initialImageSrc={videoUrl}
                        uploadFunction={uploadVideoToFirebase}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceitos: MP4, WebM, MOV. Tamanho máximo: 500MB. Duração máxima: 1 hora.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    className="border bg-white hover:bg-gray-100"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !uploadComplete || isSaving}
                  >
                    {isUploading ? 'Enviando...' : isSaving ? 'Salvando...' : 'Salvar Vídeo Aula'}
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
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
