"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { InputText } from '@/components/input';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ListActivityFilesUseCase } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.use-case';
import type { ActivityFile } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.output';

export default function StudentActivitiesCompletedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const initialActivityId = searchParams.get('activityId') || '';
  
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(!!initialActivityId);
  const [files, setFiles] = useState<ActivityFile[]>([]);
  const [activityId, setActivityId] = useState<string>(initialActivityId);
  
  const { infoUser } = useProfile();
  const institutionId = infoUser.currentIdInstitution;

  // Load existing files on component mount (same logic as ActivityFileUpload)
  const loadFiles = useCallback(async (activityIdToLoad?: string) => {
    const targetActivityId = activityIdToLoad || activityId;
    if (!targetActivityId.trim()) return;

    try {
      setIsLoadingFiles(true);
      const listUseCase = container.get<ListActivityFilesUseCase>(
        Register.content.useCase.ListActivityFilesUseCase
      );
      
      const result = await listUseCase.execute({
        activityId: targetActivityId,
        studentId,
        institutionId
      });
      
      setFiles(result.files);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [activityId, studentId, institutionId]);

  // Auto-load files if activityId is provided (same pattern as ActivityFileUpload)
  useEffect(() => {
    if (initialActivityId) {
      loadFiles(initialActivityId);
    }
  }, [initialActivityId, loadFiles]);

  const handleLoadFiles = async () => {
    if (activityId.trim()) {
      await loadFiles(activityId.trim());
    }
  };

  const handleBackToStudents = () => {
    window.location.href = '/tutor/student-activities';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('javascript')) return '📄';
    if (type.includes('html')) return '🌐';
    if (type.includes('css')) return '🎨';
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    return '📎';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) return 'javascript';
    if (['html', 'htm'].includes(extension)) return 'html';
    if (['css', 'scss', 'sass'].includes(extension)) return 'css';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'other';
  };

  const renderFilePreview = (file: ActivityFile) => {
    const fileType = getFileType(file.name);
    
    if (fileType === 'image') {
      return (
        <div className="mt-2">
          <img 
            src={file.downloadUrl} 
            alt={file.name}
            className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
            style={{ maxHeight: '300px' }}
          />
        </div>
      );
    }
    
    if (fileType === 'javascript' || fileType === 'html' || fileType === 'css') {
      return (
        <div className="mt-2">
          <iframe
            src={file.downloadUrl}
            className="w-full h-64 border border-gray-200 dark:border-gray-700 rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="primary" 
              onClick={handleBackToStudents}
              className="mb-4"
            >
              ← Voltar para Atividades dos Alunos
            </Button>
            <h1 className="text-2xl font-bold mb-2">Arquivos do Aluno</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Digite o ID da atividade para visualizar os arquivos enviados pelo aluno
            </p>
          </div>

          {/* Input para Activity ID */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buscar Arquivos da Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <InputText
                    id="activity-id-input"
                    placeholder="Digite o ID da atividade..."
                    value={activityId}
                    onChange={(e) => setActivityId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleLoadFiles}
                  variant="primary"
                  disabled={!activityId.trim() || isLoadingFiles}
                >
                  {isLoadingFiles ? 'Carregando...' : 'Buscar Arquivos'}
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <strong>Aluno ID:</strong> {studentId}
              </p>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Arquivos Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFiles ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando arquivos...</span>
                </div>
              ) : files && files.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    Arquivos Enviados ({files.length})
                    {isLoadingFiles && (
                      <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                  </h4>
                  
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={`${file.storagePath}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.sizeBytes)} • {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview Section */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                        Preview dos Arquivos
                      </h4>
                      {files.map((file, index) => (
                        <div key={`preview-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">{getFileIcon(getFileType(file.name))}</span>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {getFileType(file.name)} • {formatFileSize(file.sizeBytes)}
                              </p>
                            </div>
                          </div>
                          {renderFilePreview(file)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activityId ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
                    📁
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Nenhum arquivo encontrado
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    O aluno não enviou arquivos para esta atividade ou o ID está incorreto.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
                    🔍
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Digite um ID de atividade
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Insira o ID da atividade no campo acima para buscar os arquivos do aluno.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
