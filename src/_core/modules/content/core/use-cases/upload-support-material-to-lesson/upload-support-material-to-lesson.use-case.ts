import { injectable, inject } from 'inversify'
import { storage } from '@/_core/shared/firebase/firebase-client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository'
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository'
import { Content, ContentType } from '../../entities'
import { UploadSupportMaterialToLessonInput } from './upload-support-material-to-lesson.input'
import { UploadSupportMaterialToLessonOutput } from './upload-support-material-to-lesson.output'
import { Register } from '@/_core/shared/container'

@injectable()
export class UploadSupportMaterialToLessonUseCase {
  private readonly maxFileSize = 100 * 1024 * 1024 // 100MB
  private readonly allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]

  constructor(
    @inject(Register.content.repository.ContentRepository)
    private contentRepository: ContentRepository,

    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  async execute(input: UploadSupportMaterialToLessonInput): Promise<UploadSupportMaterialToLessonOutput> {
    const { lessonId, courseId, moduleId, institutionId, file, title } = input

    try {
      // Validações
      this.validateInput(file)

      // Verificar se a lição existe
      const lesson = await this.lessonRepository.findById(lessonId)
      if (!lesson) {
        return {
          success: false,
          message: 'Lição não encontrada'
        }
      }

      // Gerar path do arquivo
      const sanitizedFileName = this.sanitizeFileName(file.name)
      const storagePath = `courses/${institutionId}/${courseId}/modules/${moduleId}/lessons/${lessonId}/support-materials/${Date.now()}_${sanitizedFileName}`
      
      // Upload para Firebase Storage
      const storageRef = ref(storage, storagePath)
      await uploadBytes(storageRef, file)
      
      // Obter URL de download
      const downloadUrl = await getDownloadURL(storageRef)

      // Criar o conteúdo (salvamos o storagePath como parte da URL para facilitar a deleção)
      const contentId = `support_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      const content = Content.create({
        id: contentId,
        lessonId,
        type: ContentType.SUPPORT_MATERIAL,
        title: title || file.name,
        url: `${downloadUrl}#storagePath=${encodeURIComponent(storagePath)}`
      })

      // Salvar o conteúdo
      await this.contentRepository.save(content)

      // Adicionar o conteúdo à lição
      lesson.contents.push(content)
      await this.lessonRepository.save(lesson)

      return {
        success: true,
        contentId,
        downloadUrl,
        storagePath,
        message: 'Material de apoio enviado com sucesso!'
      }

    } catch (error) {
      console.error('Error uploading support material to lesson:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar material de apoio'
      }
    }
  }

  private validateInput(file: File): void {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido')
    }

    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT, imagens')
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / (1024 * 1024)}MB`)
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
  }
}
