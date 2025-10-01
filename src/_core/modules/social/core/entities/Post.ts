export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface PostProps {
  id: string;
  authorId: string;
  institutionId: string;
  title: string;
  content: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export class Post {
  private constructor(private props: PostProps) {
    this.validateTitle(props.title);
    this.validateContent(props.content);
  }

  static create(params: {
    id: string;
    authorId: string;
    institutionId: string;
    title: string;
    content: string;
  }): Post {
    const now = new Date();
    
    return new Post({
      id: params.id,
      authorId: params.authorId,
      institutionId: params.institutionId,
      title: params.title.trim(),
      content: params.content.trim(),
      status: PostStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined
    });
  }

  get id(): string {
    return this.props.id;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get institutionId(): string {
    return this.props.institutionId;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get status(): PostStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get publishedAt(): Date | undefined {
    return this.props.publishedAt;
  }

  publish(): void {
    if (this.props.status !== PostStatus.DRAFT) {
      throw new Error('Only draft posts can be published');
    }

    this.props.status = PostStatus.PUBLISHED;
    this.props.publishedAt = new Date();
    this.touch();
  }

  archive(): void {
    if (this.props.status !== PostStatus.PUBLISHED) {
      throw new Error('Only published posts can be archived');
    }

    this.props.status = PostStatus.ARCHIVED;
    this.touch();
  }

  updateContent(title: string, content: string): void {
    if (this.props.status !== PostStatus.DRAFT) {
      throw new Error('Only draft posts can be updated');
    }

    this.validateTitle(title);
    this.validateContent(content);

    this.props.title = title.trim();
    this.props.content = content.trim();
    this.touch();
  }

  touch(): void {
    this.props.updatedAt = new Date();
  }

  isDraft(): boolean {
    return this.props.status === PostStatus.DRAFT;
  }

  isPublished(): boolean {
    return this.props.status === PostStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this.props.status === PostStatus.ARCHIVED;
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Post title is required');
    }

    if (title.trim().length < 3) {
      throw new Error('Post title must be at least 3 characters long');
    }

    if (title.trim().length > 200) {
      throw new Error('Post title must not exceed 200 characters');
    }
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Post content is required');
    }

    if (content.trim().length < 10) {
      throw new Error('Post content must be at least 10 characters long');
    }

    if (content.trim().length > 50000) {
      throw new Error('Post content must not exceed 50,000 characters');
    }
  }

  toPlainObject(): PostProps {
    return {
      id: this.props.id,
      authorId: this.props.authorId,
      institutionId: this.props.institutionId,
      title: this.props.title,
      content: this.props.content,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      publishedAt: this.props.publishedAt
    };
  }

  static fromPlainObject(props: PostProps): Post {
    return new Post(props);
  }
}
