import { Certificate } from '../../core/entities/Certificate';

/**
 * Interface for the Certificate repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface CertificateRepository {
  /**
   * Generate a new unique ID for a certificate
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a certificate by id
   * @param id Certificate id
   * @returns Certificate or null if not found
   */
  findById(id: string): Promise<Certificate | null>;

  /**
   * Save a certificate
   * @param certificate Certificate to save
   * @returns Saved certificate
   */
  save(certificate: Certificate): Promise<Certificate>;

  /**
   * Delete a certificate
   * @param id Certificate id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List certificates by user
   * @param userId User id
   * @returns List of certificates
   */
  listByUser(userId: string): Promise<Certificate[]>;

  /**
   * List certificates by course
   * @param courseId Course id
   * @returns List of certificates
   */
  listByCourse(courseId: string): Promise<Certificate[]>;

  /**
   * List certificates by institution
   * @param institutionId Institution id
   * @returns List of certificates
   */
  listByInstitution(institutionId: string): Promise<Certificate[]>;

  /**
   * Find certificate by user and course
   * @param userId User id
   * @param courseId Course id
   * @returns Certificate or null if not found
   */
  findByUserAndCourse(userId: string, courseId: string): Promise<Certificate | null>;
}
