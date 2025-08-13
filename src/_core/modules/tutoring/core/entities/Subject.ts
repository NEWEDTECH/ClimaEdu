/**
 * Subject entity representing an academic subject available for tutoring
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Subject {
  private constructor(
    readonly id: string,
    public name: string,
    public description: string,
    public isActive: boolean,
    readonly createdAt: Date,
    public updatedAt: Date,
    public category?: string,
    public prerequisites?: string[]
  ) {}

  /**
   * Creates a new Subject instance
   * @param params Subject properties
   * @returns A new Subject instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    name: string;
    description: string;
    category?: string;
    prerequisites?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Subject {
    this.validateCreateParams(params);
    
    const now = new Date();
    
    return new Subject(
      params.id,
      params.name,
      params.description,
      true, // New subjects are active by default
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.category,
      params.prerequisites
    );
  }

  /**
   * Updates the subject name
   * @param newName The new name
   */
  public updateName(newName: string): void {
    if (!newName || newName.trim() === '') {
      throw new Error('Subject name cannot be empty');
    }
    
    if (newName.length > 100) {
      throw new Error('Subject name cannot exceed 100 characters');
    }
    
    this.name = newName.trim();
    this.touch();
  }

  /**
   * Updates the subject description
   * @param newDescription The new description
   */
  public updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim() === '') {
      throw new Error('Subject description cannot be empty');
    }
    
    if (newDescription.length > 500) {
      throw new Error('Subject description cannot exceed 500 characters');
    }
    
    this.description = newDescription.trim();
    this.touch();
  }

  /**
   * Updates the subject category
   * @param category The new category
   */
  public updateCategory(category: string): void {
    if (category && category.length > 50) {
      throw new Error('Subject category cannot exceed 50 characters');
    }
    
    this.category = category?.trim();
    this.touch();
  }

  /**
   * Sets the prerequisites for this subject
   * @param prerequisites Array of prerequisite subject names or descriptions
   */
  public setPrerequisites(prerequisites: string[]): void {
    if (prerequisites.length > 10) {
      throw new Error('Cannot have more than 10 prerequisites');
    }
    
    // Validate each prerequisite
    for (const prerequisite of prerequisites) {
      if (!prerequisite || prerequisite.trim() === '') {
        throw new Error('Prerequisites cannot be empty');
      }
      
      if (prerequisite.length > 100) {
        throw new Error('Each prerequisite cannot exceed 100 characters');
      }
    }
    
    this.prerequisites = prerequisites.map(p => p.trim());
    this.touch();
  }

  /**
   * Adds a single prerequisite
   * @param prerequisite The prerequisite to add
   */
  public addPrerequisite(prerequisite: string): void {
    if (!prerequisite || prerequisite.trim() === '') {
      throw new Error('Prerequisite cannot be empty');
    }
    
    if (prerequisite.length > 100) {
      throw new Error('Prerequisite cannot exceed 100 characters');
    }
    
    const trimmedPrerequisite = prerequisite.trim();
    
    if (!this.prerequisites) {
      this.prerequisites = [];
    }
    
    if (this.prerequisites.length >= 10) {
      throw new Error('Cannot have more than 10 prerequisites');
    }
    
    if (this.prerequisites.includes(trimmedPrerequisite)) {
      throw new Error('Prerequisite already exists');
    }
    
    this.prerequisites.push(trimmedPrerequisite);
    this.touch();
  }

  /**
   * Removes a prerequisite
   * @param prerequisite The prerequisite to remove
   */
  public removePrerequisite(prerequisite: string): void {
    if (!this.prerequisites || this.prerequisites.length === 0) {
      return;
    }
    
    const index = this.prerequisites.indexOf(prerequisite.trim());
    if (index > -1) {
      this.prerequisites.splice(index, 1);
      this.touch();
    }
  }

  /**
   * Activates the subject
   */
  public activate(): void {
    if (this.isActive) {
      return;
    }
    
    this.isActive = true;
    this.touch();
  }

  /**
   * Deactivates the subject
   */
  public deactivate(): void {
    if (!this.isActive) {
      return;
    }
    
    this.isActive = false;
    this.touch();
  }

  /**
   * Checks if the subject has prerequisites
   */
  public hasPrerequisites(): boolean {
    return this.prerequisites !== undefined && this.prerequisites.length > 0;
  }

  /**
   * Gets the number of prerequisites
   */
  public getPrerequisitesCount(): number {
    return this.prerequisites?.length ?? 0;
  }

  /**
   * Updates the timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validates the parameters for creating a new subject
   */
  private static validateCreateParams(params: {
    id: string;
    name: string;
    description: string;
    category?: string;
    prerequisites?: string[];
  }): void {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Subject ID is required');
    }
    
    if (!params.name || params.name.trim() === '') {
      throw new Error('Subject name is required');
    }
    
    if (params.name.length > 100) {
      throw new Error('Subject name cannot exceed 100 characters');
    }
    
    if (!params.description || params.description.trim() === '') {
      throw new Error('Subject description is required');
    }
    
    if (params.description.length > 500) {
      throw new Error('Subject description cannot exceed 500 characters');
    }
    
    if (params.category && params.category.length > 50) {
      throw new Error('Subject category cannot exceed 50 characters');
    }
    
    if (params.prerequisites) {
      if (params.prerequisites.length > 10) {
        throw new Error('Cannot have more than 10 prerequisites');
      }
      
      for (const prerequisite of params.prerequisites) {
        if (!prerequisite || prerequisite.trim() === '') {
          throw new Error('Prerequisites cannot be empty');
        }
        
        if (prerequisite.length > 100) {
          throw new Error('Each prerequisite cannot exceed 100 characters');
        }
      }
    }
  }
}
