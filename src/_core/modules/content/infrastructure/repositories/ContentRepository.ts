import { Content, ContentType } from '../../core/entities/Content';

/**
 * Interface for the Content repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ContentRepository {
  /**
   * Create new content
   * @param content Content data without id
   * @returns Created content with id
   */
  create(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content>;

  /**
   * Find content by id
   * @param id Content id
   * @returns Content or null if not found
   */
  findById(id: string): Promise<Content | null>;

  /**
   * Update content
   * @param id Content id
   * @param content Content data to update
   * @returns Updated content
   */
  update(id: string, content: Partial<Omit<Content, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Content>;

  /**
   * Delete content
   * @param id Content id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List content by type
   * @param type Content type
   * @returns List of content
   */
  listByType(type: ContentType): Promise<Content[]>;

  /**
   * List content by author
   * @param authorId Author id
   * @returns List of content
   */
  listByAuthor(authorId: string): Promise<Content[]>;

  /**
   * List content by category
   * @param category Category
   * @returns List of content
   */
  listByCategory(category: string): Promise<Content[]>;

  /**
   * Search content by title or description
   * @param term Search term
   * @returns List of content
   */
  searchByTerm(term: string): Promise<Content[]>;
}
