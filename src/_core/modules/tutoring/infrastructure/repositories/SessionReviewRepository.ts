import { SessionReview } from '../../core/entities/SessionReview';

/**
 * Repository interface for SessionReview entity
 * Following Clean Architecture principles, this interface defines the contract
 * for persistence operations without depending on specific implementations
 */
export interface SessionReviewRepository {
  /**
   * Generates a unique ID for a new session review
   * @returns Promise<string> A unique ID with 'rev_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Saves a session review to the repository
   * @param review The session review to save
   * @returns Promise<SessionReview> The saved review
   */
  save(review: SessionReview): Promise<SessionReview>;

  /**
   * Finds a session review by its ID
   * @param id The review ID
   * @returns Promise<SessionReview | null> The review if found, null otherwise
   */
  findById(id: string): Promise<SessionReview | null>;

  /**
   * Finds the review for a specific session
   * @param sessionId The session ID
   * @returns Promise<SessionReview | null> The review if found, null otherwise
   */
  findBySessionId(sessionId: string): Promise<SessionReview | null>;

  /**
   * Finds all reviews given by a specific student
   * @param studentId The student's ID
   * @returns Promise<SessionReview[]> Array of reviews
   */
  findByStudentId(studentId: string): Promise<SessionReview[]>;

  /**
   * Finds all reviews for a specific tutor
   * @param tutorId The tutor's ID
   * @param includeAnonymous Whether to include anonymous reviews
   * @returns Promise<SessionReview[]> Array of reviews
   */
  findByTutorId(tutorId: string, includeAnonymous?: boolean): Promise<SessionReview[]>;

  /**
   * Finds reviews by rating
   * @param rating The rating to filter by (1-5)
   * @param tutorId Optional tutor filter
   * @returns Promise<SessionReview[]> Array of reviews with the specified rating
   */
  findByRating(rating: number, tutorId?: string): Promise<SessionReview[]>;

  /**
   * Finds reviews within a rating range
   * @param minRating Minimum rating (inclusive)
   * @param maxRating Maximum rating (inclusive)
   * @param tutorId Optional tutor filter
   * @returns Promise<SessionReview[]> Array of reviews within the rating range
   */
  findByRatingRange(
    minRating: number,
    maxRating: number,
    tutorId?: string
  ): Promise<SessionReview[]>;

  /**
   * Finds recent reviews (within specified days)
   * @param days Number of days to look back
   * @param tutorId Optional tutor filter
   * @returns Promise<SessionReview[]> Array of recent reviews
   */
  findRecent(days: number, tutorId?: string): Promise<SessionReview[]>;

  /**
   * Gets the average rating for a tutor
   * @param tutorId The tutor's ID
   * @returns Promise<number | null> Average rating or null if no reviews
   */
  getAverageRating(tutorId: string): Promise<number | null>;

  /**
   * Gets rating statistics for a tutor
   * @param tutorId The tutor's ID
   * @returns Promise<RatingStats> Rating statistics
   */
  getRatingStats(tutorId: string): Promise<RatingStats>;

  /**
   * Gets review statistics for a student
   * @param studentId The student's ID
   * @returns Promise<StudentReviewStats> Student review statistics
   */
  getStudentReviewStats(studentId: string): Promise<StudentReviewStats>;

  /**
   * Finds top-rated tutors
   * @param limit Maximum number of tutors to return
   * @param minReviewCount Minimum number of reviews required
   * @returns Promise<TutorRating[]> Array of top-rated tutors
   */
  findTopRatedTutors(limit: number, minReviewCount?: number): Promise<TutorRating[]>;

  /**
   * Gets rating distribution for a tutor
   * @param tutorId The tutor's ID
   * @returns Promise<RatingDistribution> Rating distribution
   */
  getRatingDistribution(tutorId: string): Promise<RatingDistribution>;

  /**
   * Searches reviews by comment content
   * @param searchTerm The term to search for in comments
   * @param tutorId Optional tutor filter
   * @returns Promise<SessionReview[]> Array of matching reviews
   */
  searchByComment(searchTerm: string, tutorId?: string): Promise<SessionReview[]>;

  /**
   * Checks if a session already has a review
   * @param sessionId The session ID
   * @returns Promise<boolean> True if review exists, false otherwise
   */
  hasReview(sessionId: string): Promise<boolean>;

  /**
   * Gets reviews with pagination
   * @param tutorId The tutor's ID
   * @param page Page number (1-based)
   * @param limit Number of reviews per page
   * @param includeAnonymous Whether to include anonymous reviews
   * @returns Promise<PaginatedReviews> Paginated reviews
   */
  findPaginated(
    tutorId: string,
    page: number,
    limit: number,
    includeAnonymous?: boolean
  ): Promise<PaginatedReviews>;

  /**
   * Deletes a session review
   * @param id The review ID
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a review exists
   * @param id The review ID
   * @returns Promise<boolean> True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Interface for rating statistics
 */
export interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  positiveReviews: number; // 4-5 stars
  neutralReviews: number;  // 3 stars
  negativeReviews: number; // 1-2 stars
}

/**
 * Interface for student review statistics
 */
export interface StudentReviewStats {
  totalReviews: number;
  averageRatingGiven: number;
  anonymousReviews: number;
  publicReviews: number;
}

/**
 * Interface for tutor rating information
 */
export interface TutorRating {
  tutorId: string;
  averageRating: number;
  totalReviews: number;
  recentRating: number; // Average of last 10 reviews
}

/**
 * Interface for rating distribution
 */
export interface RatingDistribution {
  oneStar: number;
  twoStars: number;
  threeStars: number;
  fourStars: number;
  fiveStars: number;
}

/**
 * Interface for paginated reviews
 */
export interface PaginatedReviews {
  reviews: SessionReview[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
