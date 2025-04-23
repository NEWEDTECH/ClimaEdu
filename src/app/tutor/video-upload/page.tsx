"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { InputMedia } from '@/components/ui/input/input-media/InputMedia';
import { InputText } from '@/components/ui/input/input-text';

const mockUploadFunction = (
  file: File,
  onProgress: (progress: number) => void,
  onComplete: () => void
) => {
  // Simulate upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    onProgress(progress);
    if (progress >= 100) {
      clearInterval(interval);
      onComplete();
    }
  }, 200);
};

export default function VideoUploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [module, setModule] = useState('');
  
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourseId = e.target.value;
    setCourse(newCourseId);
    setModule(''); 
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  const mockCourses = [
    { id: 'c1', title: 'Introdução à Programação' },
    { id: 'c2', title: 'Desenvolvimento Web Básico' },
    { id: 'c3', title: 'Banco de Dados' },
  ];

  const mockModules = [
    { id: 'm1', courseId: 'c1', title: 'Algoritmos Básicos' },
    { id: 'm2', courseId: 'c1', title: 'Estruturas de Dados' },
    { id: 'm3', courseId: 'c2', title: 'HTML e CSS' },
    { id: 'm4', courseId: 'c2', title: 'JavaScript Básico' },
    { id: 'm5', courseId: 'c3', title: 'Modelagem de Dados' },
    { id: 'm6', courseId: 'c3', title: 'SQL Básico' },
  ];

  const handleUploadVideo = (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: () => void
  ) => {
    setIsUploading(true);
    
    mockUploadFunction(file, onProgress, () => {
      setIsUploading(false);
      setUploadComplete(true);
      onComplete();
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitle('');
    setDescription('');
    setCourse('');
    setModule('');
    setVideoUrl(undefined);
    setUploadComplete(false);
  };

  const filteredModules = mockModules.filter(
    (m) => !course || m.courseId === course
  );

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Upload de Vídeo Aula</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Faça o upload de vídeos para suas aulas
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Novo Vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título da Vídeo Aula
                    </label>
                    <InputText
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
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Curso
                      </label>
                      <select
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={course}
                        onChange={handleCourseChange}
                        required
                      >
                        <option value="">Selecione um curso</option>
                        {mockCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Módulo
                      </label>
                      <select
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={module}
                        onChange={(e) => setModule(e.target.value)}
                        required
                        disabled={!course}
                      >
                        <option value="">Selecione um módulo</option>
                        {filteredModules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))}
                      </select>
                    </div>
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
                        uploadFunction={handleUploadVideo}
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
                    variant="outline"
                    onClick={() => {
                      setTitle('');
                      setDescription('');
                      setCourse('');
                      setModule('');
                      setVideoUrl(undefined);
                      setUploadComplete(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !uploadComplete}
                  >
                    {isUploading ? 'Enviando...' : 'Salvar Vídeo Aula'}
                  </Button>
                </div>
              </form>
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
