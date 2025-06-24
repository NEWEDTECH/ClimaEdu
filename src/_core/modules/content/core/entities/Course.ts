import { Module } from './Module';

/**
 * Course entity representing a course in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Course {
  private constructor(
    readonly id: string,
    readonly institutionId: string,
    public title: string,
    public description: string,
    public coverImageUrl: string | null,
    public modules: Module[],
    readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new Course instance
   * @param params Course properties
   * @returns A new Course instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    institutionId: string;
    title: string;
    description: string;
    coverImageUrl?: string;
    modules?: Module[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Course {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }
    if (!params.title || params.title.trim() === '') {
      throw new Error('Course title cannot be empty');
    }

    if (!params.description || params.description.trim() === '') {
      throw new Error('Course description cannot be empty');
    }

    const now = new Date();

    return new Course(
      params.id,
      params.institutionId,
      params.title,
      params.description,
      params.coverImageUrl || null,
      params.modules || [],
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Adds a module to the course
   * @param module The module to add
   */
  public addModule(module: Module): void {
    this.modules.push(module);
    this.touch();
  }

  /**
   * Updates the course title
   * @param newTitle The new title
   * @throws Error if the new title is empty
   */
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Course title cannot be empty');
    }
    this.title = newTitle;
    this.touch();
  }

  /**
   * Updates the course description
   * @param newDescription The new description
   * @throws Error if the new description is empty
   */
  public updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim() === '') {
      throw new Error('Course description cannot be empty');
    }
    this.description = newDescription;
    this.touch();
  }

  /**
   * Updates the course cover image URL
   * @param newCoverImageUrl The new cover image URL or null to remove it
   */
  public updateCoverImageUrl(newCoverImageUrl: string | null): void {
    this.coverImageUrl = newCoverImageUrl;
    this.touch();
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
}
