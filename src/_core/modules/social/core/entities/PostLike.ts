export interface PostLikeProps {
  id: string;
  postId: string;
  userId: string;
  institutionId: string;
  createdAt: Date;
}

export class PostLike {
  private constructor(private props: PostLikeProps) {}

  static create(params: {
    id: string;
    postId: string;
    userId: string;
    institutionId: string;
  }): PostLike {
    return new PostLike({
      id: params.id,
      postId: params.postId,
      userId: params.userId,
      institutionId: params.institutionId,
      createdAt: new Date()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get postId(): string {
    return this.props.postId;
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

  toPlainObject(): PostLikeProps {
    return {
      id: this.props.id,
      postId: this.props.postId,
      userId: this.props.userId,
      institutionId: this.props.institutionId,
      createdAt: this.props.createdAt
    };
  }

  static fromPlainObject(props: PostLikeProps): PostLike {
    return new PostLike(props);
  }
}
