'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { UploadPdfToLessonUseCase } from '@/_core/modules/content/core/use-cases/upload-pdf-to-lesson/upload-pdf-to-lesson.use-case'
import {
  getContentTypeIcon,
  getContentTypeLabel,
  getContentTypeColor,
} from './utils'

interface ContentData {
  id: string
  title: string
  type: ContentType
  url: string
}

interface PdfUploadSectionProps {
  contents: ContentData[]
  courseId: string
  moduleId: string
  lessonId: string
  institutionId: string
  onDeleteContent: (contentId: string) => void
  onContentAdded: () => void
  isSubmitting: boolean
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  success: string | null
}

export function PdfUploadSection({
  contents,
  courseId,
  moduleId,
  lessonId,
  institutionId,
  onDeleteContent,
  onContentAdded,
  isSubmitting,
}: PdfUploadSectionProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: null
  })
  const [title, setTitle] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pdfContent = contents.find(c => c.type === ContentType.PDF)

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const file = selectedFiles[0]
    
    // Auto-fill title if empty
    if (!title.trim()) {
      const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      setTitle(fileName)
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      success: null
    })

    try {
      const uploadUseCase = container.get<UploadPdfToLessonUseCase>(
        Register.content.useCase.UploadPdfToLessonUseCase
      )

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const result = await uploadUseCase.execute({
        lessonId,
        courseId,
        moduleId,
        institutionId,
        file,
        title: title.trim() || file.name.replace(/\.[^/.]+$/, '')
      })

      clearInterval(progressInterval)

      if (result.success) {
        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          success: result.message || 'PDF enviado com sucesso!'
        })

        // Clear form
        setTitle('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // Notify parent component
        onContentAdded()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUploadState(prev => ({ ...prev, success: null, progress: 0 }))
        }, 3000)

      } else {
        setUploadState({
          isUploading: false,
          progress: 0,
          error: result.message || 'Erro desconhecido ao enviar PDF',
          success: null
        })
      }

    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar PDF',
        success: null
      })
    }
  }

  const handleDeletePdf = async () => {
    if (!pdfContent) return

    // Usar o método padrão da página que já faz tudo
    onDeleteContent(pdfContent.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>Arquivo PDF</span>
          </CardTitle>
          {pdfContent && (
            <div className="flex gap-2">
              <Button
                className="border border-red-300 text-xs px-3 py-1 bg-red-500 text-white hover:bg-red-600"
                onClick={handleDeletePdf}
                disabled={isSubmitting}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!pdfContent ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum PDF adicionado
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Faça o upload de um arquivo PDF para disponibilizar aos alunos
              </p>
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

            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="pdf-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título do PDF (opcional)
              </label>
              <input
                id="pdf-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do PDF (opcional - será preenchido automaticamente)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={uploadState.isUploading}
              />
            </div>

            {/* Upload Area */}
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="pdf-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploadState.isUploading 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                    : isDragOver
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadState.isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
                      <p className="text-sm text-red-600 dark:text-red-400">Enviando PDF...</p>
                      <div className="w-48 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
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
                        <span className="font-semibold">Clique para enviar</span> ou arraste o arquivo aqui
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Apenas arquivos PDF (até 50MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="pdf-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploadState.isUploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getContentTypeColor(pdfContent.type)} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <div className="text-white">
                      {getContentTypeIcon(pdfContent.type)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{pdfContent.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {getContentTypeLabel(pdfContent.type)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={pdfContent.url.split('#storagePath=')[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visualizar
                  </a>
                </div>
              </div>
            </div>
            <div className="aspect-[4/3] border rounded-lg overflow-hidden">
              <iframe
                src={`${pdfContent.url.split('#storagePath=')[0]}#view=FitH`}
                className="w-full h-full"
                title={pdfContent.title}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}