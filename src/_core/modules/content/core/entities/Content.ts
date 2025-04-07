import { ContentType } from './ContentType';

/**
 * Content entity representing educational content in a lesson
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Content {
  private constructor(
    readonly id: string,
    readonly lessonId: string,
    public type: ContentType,
    public title: string,
    public url: string
  ) {}

  /**
   * Creates a new Content instance
   * @param params Content properties
   * @returns A new Content instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    lessonId: string;
    type: ContentType;
    title: string;
    url: string;
  }): Content {
    if (!params.title || params.title.trim() === '') {
      throw new Error('Content title cannot be empty');
    }

    if (!params.url || params.url.trim() === '') {
      throw new Error('Content URL cannot be empty');
    }

    return new Content(
      params.id,
      params.lessonId,
      params.type,
      params.title,
      params.url
    );
  }

  /**
   * Updates the content title
   * @param newTitle The new title
   * @throws Error if the new title is empty
   */
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Content title cannot be empty');
    }
    this.title = newTitle;
  }

  /**
   * Updates the content URL
   * @param newUrl The new URL
   * @throws Error if the new URL is empty
   */
  public updateUrl(newUrl: string): void {
    if (!newUrl || newUrl.trim() === '') {
      throw new Error('Content URL cannot be empty');
    }
    this.url = newUrl;
  }
}
