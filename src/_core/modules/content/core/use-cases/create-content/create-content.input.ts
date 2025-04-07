import { ContentType } from "../../entities/ContentType";

/**
 * Input data for creating content
 */
export interface CreateContentInput {
  lessonId: string;
  title: string;
  type: ContentType;
  url: string;
}
