import { Institution } from '../../core/entities/Institution';

/**
 * Interface for the Institution repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface InstitutionRepository {
  /**
   * Generate a new unique ID for an institution
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find an institution by id
   * @param id Institution id
   * @returns Institution or null if not found
   */
  findById(id: string): Promise<Institution | null>;

  /**
   * Find an institution by domain
   * @param domain Institution domain
   * @returns Institution or null if not found
   */
  findByDomain(domain: string): Promise<Institution | null>;

  /**
   * Save an institution
   * @param institution Institution to save
   * @returns Saved institution
   */
  save(institution: Institution): Promise<Institution>;

  /**
   * Delete an institution
   * @param id Institution id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List all institutions
   * @returns List of institutions
   */
  list(): Promise<Institution[]>;
}
