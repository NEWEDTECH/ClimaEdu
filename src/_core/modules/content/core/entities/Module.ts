import { Lesson } from './Lesson';

/**
 * Module entity representing a module in a course
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Module {
  private constructor(
    readonly id: string,
    readonly courseId: string,
    public title: string,
    public coverImageUrl: string | null,
    public lessons: Lesson[],
    public order: number
  ) {}

  /**
   * Creates a new Module instance
   * @param params Module properties
   * @returns A new Module instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    courseId: string;
    title: string;
    coverImageUrl?: string;
    order: number;
    lessons?: Lesson[];
  }): Module {
    if (!params.title || params.title.trim() === '') {
      throw new Error('Module title cannot be empty');
    }

    if (params.order < 0) {
      throw new Error('Module order must be a non-negative number');
    }

    return new Module(
      params.id,
      params.courseId,
      params.title,
      params.coverImageUrl || null,
      params.lessons || [],
      params.order
    );
  }

  /**
   * Adds a lesson to the module
   * @param lesson The lesson to add
   */
  public addLesson(lesson: Lesson): void {
    this.lessons.push(lesson);
  }

  /**
   * Updates the module title
   * @param newTitle The new title
   * @throws Error if the new title is empty
   */
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Module title cannot be empty');
    }
    this.title = newTitle;
  }

  /**
   * Updates the module cover image URL
   * @param newCoverImageUrl The new cover image URL or null to remove it
   */
  public updateCoverImageUrl(newCoverImageUrl: string | null): void {
    this.coverImageUrl = newCoverImageUrl;
  }

  /**
   * Reorders a lesson within the module
   * @param lessonId The ID of the lesson to reorder
   * @param newOrder The new order for the lesson
   * @throws Error if the lesson is not found or the new order is invalid
   */
  public reorderLesson(lessonId: string, newOrder: number): void {
    const lessonIndex = this.lessons.findIndex(lesson => lesson.id === lessonId);
    
    if (lessonIndex === -1) {
      throw new Error(`Lesson with ID ${lessonId} not found in this module`);
    }
    
    if (newOrder < 0 || newOrder >= this.lessons.length) {
      throw new Error(`New order must be between 0 and ${this.lessons.length - 1}`);
    }
    
    // Update the order of the lesson
    this.lessons[lessonIndex].order = newOrder;
    
    // Sort lessons by order
    this.lessons.sort((a, b) => a.order - b.order);
  }
}
