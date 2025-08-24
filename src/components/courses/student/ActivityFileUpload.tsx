'use client';

import React, { useState, useRef, useCallback } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { UploadActivityFilesUseCase } from '@/_core/modules/content/core/use-cases/upload-activity-files/upload-activity-files.use-case';
import { ListActivityFilesUseCase } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.use-case';
import { DeleteActivityFileUseCase } from '@/_core/modules/content/core/use-cases/delete-activity-file/delete-activity-file.use-case';
import type { ActivityFile } from '@/_core/modules/content/core/use-cases/list-activity-files/list-activity-files.output';

interface ActivityFileUploadProps {
  activityId: string;
  studentId: string;
  institutionId: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: string | null;
}

export function ActivityFileUpload({ activityId, studentId, institutionId }: ActivityFileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: null
  });
  const [files, setFiles] = useState<ActivityFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing files on component mount
  const loadFiles = useCallback(async () => {
    try {
      setIsLoadingFiles(true);
      const listUseCase = container.get<ListActivityFilesUseCase>(
        Register.content.useCase.ListActivityFilesUseCase
      );
      
      const result = await listUseCase.execute({
        activityId,
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

  React.useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      success: null
    });

    try {
      console.log('Available use cases:', Register.content.useCase);
      console.log('Looking for:', 'UploadActivityFilesUseCase');
      
      const uploadUseCase = container.get<UploadActivityFilesUseCase>(
        Register.content.useCase.UploadActivityFilesUseCase
      );

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const result = await uploadUseCase.execute({
        activityId,
        studentId,
        institutionId,
        files: filesArray
      });

      clearInterval(progressInterval);
      
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        success: `${result.uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`
      });

      // Reload files list
      await loadFiles();
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, success: null, progress: 0 }));
      }, 3000);

    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar arquivos',
        success: null
      });
    }
  };

  const handleDeleteFile = async (file: ActivityFile) => {
    if (!confirm(`Tem certeza que deseja deletar o arquivo "${file.name}"?`)) {
      return;
    }

    try {
      const deleteUseCase = container.get<DeleteActivityFileUseCase>(
        Register.content.useCase.DeleteActivityFileUseCase
      );

      const result = await deleteUseCase.execute({
        filePath: file.storagePath,
        studentId,
        institutionId,
        activityId
      });

      if (result.success) {
        setUploadState(prev => ({
          ...prev,
          success: 'Arquivo deletado com sucesso!',
          error: null
        }));
        
        // Reload files list
        await loadFiles();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setUploadState(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        setUploadState(prev => ({
          ...prev,
          error: result.message || 'Erro ao deletar arquivo',
          success: null
        }));
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar arquivo',
        success: null
      }));
    }
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Enviar Arquivos da Atividade
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Máximo: 5 arquivos, 10MB cada
        </div>
      </div>

      {/* Messages */}
      {uploadState.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{uploadState.error}</p>
          </div>
        </div>
      )}

      {uploadState.success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200">{uploadState.success}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploadState.isUploading 
                ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploadState.isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Enviando arquivos...</p>
                  <div className="w-48 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{uploadState.progress}%</p>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Clique para enviar</span> ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (até 10MB)
                  </p>
                </>
              )}
            </div>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={uploadState.isUploading}
            />
          </label>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          Arquivos Enviados
          {isLoadingFiles && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </h4>
        
        {files.length === 0 && !isLoadingFiles ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Nenhum arquivo enviado ainda</p>
          </div>
        ) : (
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
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}