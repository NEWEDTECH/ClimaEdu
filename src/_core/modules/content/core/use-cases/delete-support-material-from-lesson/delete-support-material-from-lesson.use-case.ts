import { injectable, inject } from 'inversify'
import { storage } from '@/_core/shared/firebase/firebase-client'
import { ref, deleteObject } from 'firebase/storage'
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository'
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository'
import { ContentType } from '../../entities'
import { DeleteSupportMaterialFromLessonInput } from './delete-support-material-from-lesson.input'
import { DeleteSupportMaterialFromLessonOutput } from './delete-support-material-from-lesson.output'
import { Register } from '@/_core/shared/container'

@injectable()
export class DeleteSupportMaterialFromLessonUseCase {
  constructor(
    @inject(Register.content.repository.ContentRepository)
    private contentRepository: ContentRepository,

    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  async execute(input: DeleteSupportMaterialFromLessonInput): Promise<DeleteSupportMaterialFromLessonOutput> {
    const { lessonId, contentId } = input

    try {
      // Buscar a lição
      const lesson = await this.lessonRepository.findById(lessonId)
      if (!lesson) {
        return {
          success: false,
          message: 'Lição não encontrada'
        }
      }

      // Buscar o conteúdo de Material de Apoio
      const content = lesson.contents.find(c => c.id === contentId && c.type === ContentType.SUPPORT_MATERIAL)
      if (!content) {
        return {
          success: false,
          message: 'Material de apoio não encontrado nesta lição'
        }
      }

      const isStorageFile = content.url.includes('#storagePath=') || 
                           content.url.includes('firebasestorage.googleapis.com')
      
      if (isStorageFile) {
        let storagePath: string
        try {
          if (content.url.includes('#storagePath=')) {
            // Novo formato: URL#storagePath=encodedPath
            const hashPart = content.url.split('#storagePath=')[1]
            storagePath = decodeURIComponent(hashPart)
          } else {
            // Formato antigo: tentar extrair da URL do Firebase Storage
            const url = new URL(content.url)
            const pathMatch = url.pathname.match(/\/o\/(.+)\?/) || url.pathname.match(/\/o\/(.+)$/)
            if (pathMatch) {
              storagePath = decodeURIComponent(pathMatch[1])
            } else {
              // Fallback: tentar extrair do pathname
              const fullPath = url.pathname.replace('/v0/b/', '').replace('/o/', '')
              if (fullPath) {
                storagePath = decodeURIComponent(fullPath.split('?')[0])
              } else {
                throw new Error('Não foi possível extrair o path do storage da URL')
              }
            }
          }

          // Deletar o arquivo do Firebase Storage
          const storageRef = ref(storage, storagePath)
          await deleteObject(storageRef)
        } catch (error) {
          console.warn('Erro ao deletar arquivo do Storage (pode não existir):', error)
        }
      }

      // Remover o conteúdo da lição
      lesson.contents = lesson.contents.filter(c => c.id !== contentId)
      await this.lessonRepository.save(lesson)

      // Deletar o registro do conteúdo
      await this.contentRepository.delete(contentId)

      return {
        success: true,
        message: 'Material de apoio removido com sucesso!'
      }

    } catch (error) {
      console.error('Error deleting support material from lesson:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao remover material de apoio'
      }
    }
  }
}
