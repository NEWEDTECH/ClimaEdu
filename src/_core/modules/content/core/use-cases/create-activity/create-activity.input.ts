/**
 * Input data for creating an activity
 */
export interface CreateActivityInput {
  lessonId: string;
  description: string;
  instructions: string;
  resourceUrl?: string;
}
