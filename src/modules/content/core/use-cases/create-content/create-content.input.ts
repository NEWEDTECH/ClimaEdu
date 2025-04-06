import { ContentType } from '../../entities/Content';

/**
 * Input data for creating content
 */
export interface CreateContentInput {
  title: string;
  description: string;
  type: ContentType;
  url: string;
  categories: string[];
  authorId: string;
}
