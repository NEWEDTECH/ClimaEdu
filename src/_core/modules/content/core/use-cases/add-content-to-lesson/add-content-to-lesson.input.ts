import { ContentType } from '../../entities/ContentType';

/**
 * Input data for adding content to a lesson
 */
export interface AddContentToLessonInput {
  lessonId: string;
  type: ContentType;
  title: string;
  url: string;
}
