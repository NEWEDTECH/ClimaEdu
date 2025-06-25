export interface CommentLikeProps {
  id: string;
  commentId: string;
  userId: string;
  institutionId: string;
  createdAt: Date;
}

export class CommentLike {
  private constructor(private props: CommentLikeProps) {}

  static create(params: {
    id: string;
    commentId: string;
    userId: string;
    institutionId: string;
  }): CommentLike {
    return new CommentLike({
      id: params.id,
      commentId: params.commentId,
      userId: params.userId,
      institutionId: params.institutionId,
      createdAt: new Date()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get commentId(): string {
    return this.props.commentId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get institutionId(): string {
    return this.props.institutionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPlainObject(): CommentLikeProps {
    return {
      id: this.props.id,
      commentId: this.props.commentId,
      userId: this.props.userId,
      institutionId: this.props.institutionId,
      createdAt: this.props.createdAt
    };
  }

  static fromPlainObject(props: CommentLikeProps): CommentLike {
    return new CommentLike(props);
  }
}
