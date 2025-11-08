'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { Upload, FileText, X, FolderDown } from 'lucide-react'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { UploadSupportMaterialToLessonUseCase } from '@/_core/modules/content/core/use-cases/upload-support-material-to-lesson/upload-support-material-to-lesson.use-case'
import { DeleteSupportMaterialFromLessonUseCase } from '@/_core/modules/content/core/use-cases/delete-support-material-from-lesson/delete-support-material-from-lesson.use-case'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import { showToast } from '@/components/toast'

interface SupportMaterialUploadFormProps {
  courseId: string
  moduleId: string
  lessonId: string
  institutionId: string
}

type SupportMaterial = {
  id: string
  title: string
  url: string
}

export function SupportMaterialUploadForm({
  courseId,
  moduleId,
  lessonId,
  institutionId
}: SupportMaterialUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [materials, setMaterials] = useState<SupportMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load existing materials
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )
        const lesson = await lessonRepository.findById(lessonId)
        if (lesson) {
          const supportMats = lesson.contents
            .filter(c => c.type === ContentType.SUPPORT_MATERIAL)
            .map(c => ({
              id: c.id,
              title: c.title,
              url: c.url
            }))
          setMaterials(supportMats)
        }
      } catch (error) {
        console.error('Error loading materials:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMaterials()
  }, [lessonId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Auto-fill title with filename without extension
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      
      if (!title) {
        const nameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt)
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      showToast.error('Por favor, selecione um arquivo e forneça um título')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const uploadUseCase = container.get<UploadSupportMaterialToLessonUseCase>(
        Register.content.useCase.UploadSupportMaterialToLessonUseCase
      )

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const result = await uploadUseCase.execute({
        lessonId,
        institutionId,
        courseId,
        moduleId,
        file,
        title: title.trim()
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add to materials list
      setMaterials(prev => [...prev, {
        id: result.contentId || '',
        title: title.trim(),
        url: result.downloadUrl || ''
      }])

      showToast.success('Material de apoio enviado com sucesso!')
      
      // Reset form
      setFile(null)
      setTitle('')
      setUploadProgress(0)
    } catch (error) {
      console.error('Error uploading material:', error)
      showToast.error('Erro ao enviar material de apoio')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) {
      return
    }

    try {
      const deleteUseCase = container.get<DeleteSupportMaterialFromLessonUseCase>(
        Register.content.useCase.DeleteSupportMaterialFromLessonUseCase
      )

      await deleteUseCase.execute({ lessonId, contentId: materialId })

      setMaterials(prev => prev.filter(m => m.id !== materialId))
      showToast.success('Material excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting material:', error)
      showToast.error('Erro ao excluir material')
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '📽️'
      case 'zip':
      case 'rar':
        return '🗜️'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'txt':
        return '📃'
      default:
        return '📁'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <FolderDown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span>Upload de Material de Apoio</span>
          </CardTitle>
          <CardDescription>
            Envie materiais complementares para a lição (PDF, DOC, XLS, PPT, ZIP, Imagens, etc)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm font-medium mb-2">
              {file ? file.name : 'Arraste um arquivo ou clique para selecionar'}
            </p>
            <p className="text-xs text-gray-500">
              Limite: 100MB
            </p>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title-input" className="block text-sm font-medium mb-2">
              Título do Material
            </label>
            <InputText
              id="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apostila Complementar"
              disabled={isUploading}
            />
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">
                Enviando... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || !title.trim() || isUploading}
            variant="primary"
            className="w-full"
          >
            {isUploading ? 'Enviando...' : 'Enviar Material'}
          </Button>
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Materiais Adicionados ({materials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-4">Carregando materiais...</p>
          ) : materials.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Nenhum material adicionado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl">{getFileIcon(material.title)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{material.title}</p>
                      <p className="text-xs text-gray-500">Material de Apoio</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={material.url.split('#storagePath=')[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Abrir
                    </a>
                    <Button
                      onClick={() => handleDelete(material.id)}
                      variant="secondary"
                      className="text-xs px-2 py-1"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
