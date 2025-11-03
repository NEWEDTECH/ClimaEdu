import { injectable, inject } from 'inversify'
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository'
import { Register } from '@/_core/shared/container'

export type UpdateLessonContentSectionsOrderInput = {
  lessonId: string
  contentSectionsOrder: string[]
}

export type UpdateLessonContentSectionsOrderOutput = {
  success: boolean
}

@injectable()
export class UpdateLessonContentSectionsOrderUseCase {
  constructor(
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository
  ) {}

  async execute(
    input: UpdateLessonContentSectionsOrderInput
  ): Promise<UpdateLessonContentSectionsOrderOutput> {
    const { lessonId, contentSectionsOrder } = input

    // Validate that we have exactly 7 content types
    const validTypes = ['description', 'video', 'scorm', 'pdf', 'audio', 'activity', 'questionnaire']
    if (contentSectionsOrder.length !== 7 || !contentSectionsOrder.every(type => validTypes.includes(type))) {
      throw new Error('Invalid content sections order. Must include all 7 types.')
    }

    const lesson = await this.lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('Lesson not found')
    }

    // Update the content sections order
    lesson.contentSectionsOrder = contentSectionsOrder

    await this.lessonRepository.save(lesson)

    return { success: true }
  }
}
