import { BadgeCriteriaType } from './BadgeCriteriaType';

/**
 * Badge
 * 
 * Persona: Student
 * Purpose: Defines a badge (medal) that students can earn by achieving specific criteria.
 * 
 * Fields:
 * - id: Unique identifier for the badge
 * - name: Display name of the badge (e.g., "First Course Completed")
 * - description: Detailed explanation of what the badge represents
 * - iconUrl: URL to the badge image for display in the UI
 * - criteriaType: What action triggers this badge (e.g., course completion)
 * - criteriaValue: Number of actions needed to earn the badge (e.g., 3 completed courses)
 */
export class Badge {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly iconUrl: string,
    readonly criteriaType: BadgeCriteriaType,
    readonly criteriaValue: number
  ) {}

  /**
   * Creates a new Badge instance
   * @param params Badge properties
   * @returns A new Badge instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    criteriaType: BadgeCriteriaType;
    criteriaValue: number;
  }): Badge {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Badge ID cannot be empty');
    }

    if (!params.name || params.name.trim() === '') {
      throw new Error('Badge name cannot be empty');
    }

    if (!params.description || params.description.trim() === '') {
      throw new Error('Badge description cannot be empty');
    }

    if (!params.iconUrl || params.iconUrl.trim() === '') {
      throw new Error('Badge icon URL cannot be empty');
    }

    // Validate that criteriaType is a valid enum value
    if (!Object.values(BadgeCriteriaType).includes(params.criteriaType)) {
      throw new Error(`Invalid badge criteria type: ${params.criteriaType}`);
    }

    if (params.criteriaValue <= 0) {
      throw new Error('Badge criteria value must be greater than zero');
    }

    return new Badge(
      params.id,
      params.name,
      params.description,
      params.iconUrl,
      params.criteriaType,
      params.criteriaValue
    );
  }

  /**
   * Checks if a given count meets the criteria for earning this badge
   * @param count The count to check against the criteria value
   * @returns True if the count meets or exceeds the criteria value
   */
  public isCriteriaMet(count: number): boolean {
    return count >= this.criteriaValue;
  }

  /**
   * Gets the remaining count needed to earn this badge
   * @param currentCount The current count
   * @returns The number of additional actions needed to earn the badge
   */
  public getRemainingCount(currentCount: number): number {
    if (currentCount >= this.criteriaValue) {
      return 0;
    }
    return this.criteriaValue - currentCount;
  }

  /**
   * Gets the progress percentage towards earning this badge
   * @param currentCount The current count
   * @returns The percentage of progress (0-100)
   */
  public getProgressPercentage(currentCount: number): number {
    if (currentCount >= this.criteriaValue) {
      return 100;
    }
    return Math.round((currentCount / this.criteriaValue) * 100);
  }
}
