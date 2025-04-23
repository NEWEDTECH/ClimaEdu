import { Content } from '../../entities/Content';
import { Lesson } from '../../entities/Lesson';

/**
 * Output data for adding content to a lesson
 */
export interface AddContentToLessonOutput {
  content: Content;
  lesson: Lesson;
}
