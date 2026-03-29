export class FAQ {
  private constructor(
    readonly id: string,
    readonly institutionId: string,
    private _title: string,
    private _content: string,
    readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  public static create(params: {
    id: string;
    institutionId: string;
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): FAQ {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }
    if (!params.title || params.title.trim() === '') {
      throw new Error('FAQ title cannot be empty');
    }

    const now = new Date();
    return new FAQ(
      params.id,
      params.institutionId,
      params.title.trim(),
      params.content ?? '',
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  public get title(): string { return this._title; }
  public get content(): string { return this._content; }
  public get updatedAt(): Date { return this._updatedAt; }

  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('FAQ title cannot be empty');
    }
    this._title = newTitle.trim();
    this.touch();
  }

  public updateContent(newContent: string): void {
    this._content = newContent;
    this.touch();
  }

  public touch(): void {
    this._updatedAt = new Date();
  }
}
