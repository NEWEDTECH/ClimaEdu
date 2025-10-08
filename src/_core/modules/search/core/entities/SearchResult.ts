export enum SearchResultType {
  COURSE = 'course',
  PODCAST = 'podcast',
  TRAIL = 'trail'
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: SearchResultType;
  imageUrl?: string;
  href: string;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SearchResultEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: SearchResultType,
    public readonly institutionId: string,
    public readonly href: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description?: string,
    public readonly imageUrl?: string
  ) {}

  static create(props: {
    id: string;
    title: string;
    type: SearchResultType;
    institutionId: string;
    href: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    imageUrl?: string;
  }): SearchResultEntity {
    return new SearchResultEntity(
      props.id,
      props.title,
      props.type,
      props.institutionId,
      props.href,
      props.createdAt,
      props.updatedAt,
      props.description,
      props.imageUrl
    );
  }

  toJSON(): SearchResult {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      imageUrl: this.imageUrl,
      href: this.href,
      institutionId: this.institutionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
