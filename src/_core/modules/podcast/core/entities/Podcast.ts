import { PodcastMediaType } from './PodcastMediaType';

/**
 * Podcast entity representing a podcast in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Podcast {
  private constructor(
    readonly id: string,
    readonly institutionId: string,
    private _title: string,
    private _description: string,
    private _tags: string[],
    private _coverImageUrl: string,
    private _mediaUrl: string,
    private _mediaType: PodcastMediaType,
    readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  /**
   * Creates a new Podcast instance
   * @param params Podcast properties
   * @returns A new Podcast instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    institutionId: string;
    title: string;
    description: string;
    tags?: string[];
    coverImageUrl: string;
    mediaUrl: string;
    mediaType: PodcastMediaType;
    createdAt?: Date;
    updatedAt?: Date;
  }): Podcast {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (!params.title || params.title.trim() === '') {
      throw new Error('Podcast title cannot be empty');
    }

    if (params.title.length < 3 || params.title.length > 200) {
      throw new Error('Podcast title must be between 3 and 200 characters');
    }

    if (!params.description || params.description.trim() === '') {
      throw new Error('Podcast description cannot be empty');
    }

    if (params.description.length < 10 || params.description.length > 1000) {
      throw new Error('Podcast description must be between 10 and 1000 characters');
    }

    if (!params.coverImageUrl || params.coverImageUrl.trim() === '') {
      throw new Error('Cover image URL cannot be empty');
    }

    if (!params.mediaUrl || params.mediaUrl.trim() === '') {
      throw new Error('Media URL cannot be empty');
    }

    if (params.tags && params.tags.length > 10) {
      throw new Error('Maximum of 10 tags allowed');
    }

    const now = new Date();

    return new Podcast(
      params.id,
      params.institutionId,
      params.title.trim(),
      params.description.trim(),
      params.tags || [],
      params.coverImageUrl.trim(),
      params.mediaUrl.trim(),
      params.mediaType,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  // Getters
  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get tags(): string[] {
    return [...this._tags]; // Return a copy to maintain immutability
  }

  public get coverImageUrl(): string {
    return this._coverImageUrl;
  }

  public get mediaUrl(): string {
    return this._mediaUrl;
  }

  public get mediaType(): PodcastMediaType {
    return this._mediaType;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Updates the podcast title
   * @param newTitle The new title
   * @throws Error if the new title is invalid
   */
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Podcast title cannot be empty');
    }

    if (newTitle.length < 3 || newTitle.length > 200) {
      throw new Error('Podcast title must be between 3 and 200 characters');
    }

    this._title = newTitle.trim();
    this.touch();
  }

  /**
   * Updates the podcast description
   * @param newDescription The new description
   * @throws Error if the new description is invalid
   */
  public updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim() === '') {
      throw new Error('Podcast description cannot be empty');
    }

    if (newDescription.length < 10 || newDescription.length > 1000) {
      throw new Error('Podcast description must be between 10 and 1000 characters');
    }

    this._description = newDescription.trim();
    this.touch();
  }

  /**
   * Updates the podcast tags
   * @param newTags The new tags array
   * @throws Error if too many tags are provided
   */
  public updateTags(newTags: string[]): void {
    if (newTags.length > 10) {
      throw new Error('Maximum of 10 tags allowed');
    }

    this._tags = [...newTags]; // Create a copy
    this.touch();
  }

  /**
   * Updates the cover image URL
   * @param newCoverImageUrl The new cover image URL
   * @throws Error if the URL is empty
   */
  public updateCoverImage(newCoverImageUrl: string): void {
    if (!newCoverImageUrl || newCoverImageUrl.trim() === '') {
      throw new Error('Cover image URL cannot be empty');
    }

    this._coverImageUrl = newCoverImageUrl.trim();
    this.touch();
  }

  /**
   * Updates the media URL
   * @param newMediaUrl The new media URL
   * @throws Error if the URL is empty
   */
  public updateMediaUrl(newMediaUrl: string): void {
    if (!newMediaUrl || newMediaUrl.trim() === '') {
      throw new Error('Media URL cannot be empty');
    }

    this._mediaUrl = newMediaUrl.trim();
    this.touch();
  }

  /**
   * Updates the media type
   * @param newMediaType The new media type
   */
  public updateMediaType(newMediaType: PodcastMediaType): void {
    this._mediaType = newMediaType;
    this.touch();
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this._updatedAt = new Date();
  }
}
