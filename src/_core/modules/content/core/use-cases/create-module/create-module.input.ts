/**
 * Input data for creating a module
 */
export interface CreateModuleInput {
  courseId: string;
  title: string;
  coverImageUrl?: string;
  order: number;
}
