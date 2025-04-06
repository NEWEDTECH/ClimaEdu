/**
 * Content entity representing educational content in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  url: string;
  categories: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enum representing the types of content in the system
 */
export enum ContentType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  PODCAST = 'PODCAST',
  TEXT = 'TEXT',
}
