import { injectable, inject } from 'inversify';
import { storage } from '@/_core/shared/firebase/firebase-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { Content, ContentType } from '../../entities';
import { UploadMp3ToLessonInput } from './upload-mp3-to-lesson.input';
import { UploadMp3ToLessonOutput } from './upload-mp3-to-lesson.output';
import { Register } from '@/_core/shared/container';

@injectable()
export class UploadMp3ToLessonUseCase {
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly allowedTypes = ['audio/mpeg', 'audio/mp3'];

  constructor(
    @inject(Register.content.repository.ContentRepository)
    private contentRepository: ContentRepository,

    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  async execute(input: UploadMp3ToLessonInput): Promise<UploadMp3ToLessonOutput> {
    const { lessonId, courseId, moduleId, institutionId, file, title } = input;

    try {
      // Validações
      this.validateInput(file);

      // Verificar se a lição existe
      const lesson = await this.lessonRepository.findById(lessonId);
      if (!lesson) {
        return {
          success: false,
          message: 'Lição não encontrada'
        };
      }

      // Verificar se já existe um MP3 na lição
      const existingMp3Content = lesson.contents.find(content => content.type === ContentType.AUDIO);
      if (existingMp3Content) {
        return {
          success: false,
          message: 'Já existe um áudio MP3 nesta lição. Remova-o primeiro para enviar um novo.'
        };
      }

      // Gerar path do arquivo
      const sanitizedFileName = this.sanitizeFileName(file.name);
      const storagePath = `courses/${institutionId}/${courseId}/modules/${moduleId}/lessons/${lessonId}/mp3/${sanitizedFileName}`;
      
      // Upload para Firebase Storage
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      
      // Obter URL de download
      const downloadUrl = await getDownloadURL(storageRef);

      // Criar o conteúdo (salvamos o storagePath como parte da URL para facilitar a deleção)
      const contentId = `mp3_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      const content = Content.create({
        id: contentId,
        lessonId,
        type: ContentType.AUDIO,
        title: title || file.name,
        url: `${downloadUrl}#storagePath=${encodeURIComponent(storagePath)}`
      });

      // Salvar o conteúdo
      await this.contentRepository.save(content);

      // Adicionar o conteúdo à lição
      lesson.contents.push(content);
      await this.lessonRepository.save(lesson);

      return {
        success: true,
        contentId,
        downloadUrl,
        storagePath,
        message: 'MP3 enviado com sucesso!'
      };

    } catch (error) {
      console.error('Error uploading MP3 to lesson:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar MP3'
      };
    }
  }

  private validateInput(file: File): void {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Apenas arquivos MP3 são permitidos');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / (1024 * 1024)}MB`);
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }
}