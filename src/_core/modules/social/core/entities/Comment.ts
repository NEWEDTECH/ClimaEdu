export interface CommentProps {
  id: string;
  postId: string;
  parentCommentId?: string;
  authorId: string;
  institutionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  private constructor(private props: CommentProps) {
    this.validateContent(props.content);
  }

  static create(params: {
    id: string;
    postId: string;
    parentCommentId?: string;
    authorId: string;
    institutionId: string;
    content: string;
  }): Comment {
    const now = new Date();
    
    return new Comment({
      id: params.id,
      postId: params.postId,
      parentCommentId: params.parentCommentId,
      authorId: params.authorId,
      institutionId: params.institutionId,
      content: params.content.trim(),
      createdAt: now,
      updatedAt: now
    });
  }

  get id(): string {
    return this.props.id;
  }

  get postId(): string {
    return this.props.postId;
  }

  get parentCommentId(): string | undefined {
    return this.props.parentCommentId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get institutionId(): string {
    return this.props.institutionId;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateContent(newContent: string): void {
    this.validateContent(newContent);
    this.props.content = newContent.trim();
    this.touch();
  }

  touch(): void {
    this.props.updatedAt = new Date();
  }

  isReply(): boolean {
    return this.props.parentCommentId !== undefined;
  }

  isTopLevel(): boolean {
    return this.props.parentCommentId === undefined;
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    if (content.trim().length < 1) {
      throw new Error('Comment content must be at least 1 character long');
    }

    if (content.trim().length > 2000) {
      throw new Error('Comment content must not exceed 2,000 characters');
    }
  }

  toPlainObject(): CommentProps {
    return {
      id: this.props.id,
      postId: this.props.postId,
      parentCommentId: this.props.parentCommentId,
      authorId: this.props.authorId,
      institutionId: this.props.institutionId,
      content: this.props.content,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  static fromPlainObject(props: CommentProps): Comment {
    return new Comment(props);
  }
}
