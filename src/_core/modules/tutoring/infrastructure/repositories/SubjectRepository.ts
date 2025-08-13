import { Subject } from '../../core/entities/Subject';

/**
 * Repository interface for Subject entity
 * Following Clean Architecture principles, this interface defines the contract
 * for persistence operations without depending on specific implementations
 */
export interface SubjectRepository {
  /**
   * Generates a unique ID for a new subject
   * @returns Promise<string> A unique ID with 'sub_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Saves a subject to the repository
   * @param subject The subject to save
   * @returns Promise<Subject> The saved subject
   */
  save(subject: Subject): Promise<Subject>;

  /**
   * Finds a subject by its ID
   * @param id The subject ID
   * @returns Promise<Subject | null> The subject if found, null otherwise
   */
  findById(id: string): Promise<Subject | null>;

  /**
   * Finds a subject by its name
   * @param name The subject name
   * @returns Promise<Subject | null> The subject if found, null otherwise
   */
  findByName(name: string): Promise<Subject | null>;

  /**
   * Finds all active subjects
   * @returns Promise<Subject[]> Array of active subjects
   */
  findAllActive(): Promise<Subject[]>;

  /**
   * Finds all subjects (active and inactive)
   * @returns Promise<Subject[]> Array of all subjects
   */
  findAll(): Promise<Subject[]>;

  /**
   * Finds subjects by category
   * @param category The category to filter by
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<Subject[]> Array of subjects in the category
   */
  findByCategory(category: string, activeOnly?: boolean): Promise<Subject[]>;

  /**
   * Finds subjects that have specific prerequisites
   * @param prerequisite The prerequisite to search for
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<Subject[]> Array of subjects with the prerequisite
   */
  findByPrerequisite(prerequisite: string, activeOnly?: boolean): Promise<Subject[]>;

  /**
   * Searches subjects by name or description
   * @param searchTerm The term to search for
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<Subject[]> Array of matching subjects
   */
  search(searchTerm: string, activeOnly?: boolean): Promise<Subject[]>;

  /**
   * Gets all unique categories
   * @param activeOnly Whether to include only categories from active subjects
   * @returns Promise<string[]> Array of unique categories
   */
  getCategories(activeOnly?: boolean): Promise<string[]>;

  /**
   * Gets subjects available for a specific tutor
   * @param tutorId The tutor's ID
   * @returns Promise<Subject[]> Array of subjects the tutor can teach
   */
  findByTutorId(tutorId: string): Promise<Subject[]>;

  /**
   * Gets the count of active subjects
   * @returns Promise<number> Number of active subjects
   */
  getActiveCount(): Promise<number>;

  /**
   * Gets the count of subjects by category
   * @param activeOnly Whether to count only active subjects
   * @returns Promise<CategoryCount[]> Array of category counts
   */
  getCountByCategory(activeOnly?: boolean): Promise<CategoryCount[]>;

  /**
   * Checks if a subject name already exists
   * @param name The subject name to check
   * @param excludeId Optional ID to exclude from the check (for updates)
   * @returns Promise<boolean> True if name exists, false otherwise
   */
  nameExists(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Deletes a subject
   * @param id The subject ID
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a subject exists
   * @param id The subject ID
   * @returns Promise<boolean> True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;

  /**
   * Gets subjects with their tutoring session counts
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<SubjectWithStats[]> Array of subjects with statistics
   */
  findWithSessionStats(activeOnly?: boolean): Promise<SubjectWithStats[]>;
}

/**
 * Interface for category count statistics
 */
export interface CategoryCount {
  category: string;
  count: number;
}

/**
 * Interface for subject with session statistics
 */
export interface SubjectWithStats {
  subject: Subject;
  totalSessions: number;
  completedSessions: number;
  averageRating?: number;
  activeTutors: number;
}
