/**
 * Activity entity representing a learning activity for a lesson
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Activity {
  private constructor(
    public description: string,
    public instructions: string,
    public resourceUrl?: string
  ) {}

  /**
   * Creates a new Activity instance
   * @param params Activity properties
   * @returns A new Activity instance
   * @throws Error if validation fails
   */
  public static create(params: {
    description: string;
    instructions: string;
    resourceUrl?: string;
  }): Activity {
    if (!params.description || params.description.trim() === '') {
      throw new Error('Activity description cannot be empty');
    }

    if (!params.instructions || params.instructions.trim() === '') {
      throw new Error('Activity instructions cannot be empty');
    }

    return new Activity(
      params.description,
      params.instructions,
      params.resourceUrl
    );
  }

  /**
   * Updates the activity description
   * @param newDescription The new description
   * @throws Error if the new description is empty
   */
  public updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim() === '') {
      throw new Error('Activity description cannot be empty');
    }
    this.description = newDescription;
  }

  /**
   * Updates the activity instructions
   * @param newInstructions The new instructions
   * @throws Error if the new instructions are empty
   */
  public updateInstructions(newInstructions: string): void {
    if (!newInstructions || newInstructions.trim() === '') {
      throw new Error('Activity instructions cannot be empty');
    }
    this.instructions = newInstructions;
  }

  /**
   * Updates the activity resource URL
   * @param newUrl The new resource URL
   */
  public updateResourceUrl(newUrl: string): void {
    this.resourceUrl = newUrl;
  }
}
