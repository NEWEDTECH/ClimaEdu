import { Content } from '../../core/entities/Content';
import { ContentType } from '../../core/entities/ContentType';

/**
 * Interface for the Content repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ContentRepository {
  /**
   * Generate a new unique ID for content
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find content by id
   * @param id Content id
   * @returns Content or null if not found
   */
  findById(id: string): Promise<Content | null>;

  /**
   * Save content
   * @param content Content to save
   * @returns Saved content
   */
  save(content: Content): Promise<Content>;

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
