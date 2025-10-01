export class Note {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public content: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(
    id: string,
    userId: string,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(props: {
    id?: string;
    userId: string;
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Note {
    const now = new Date();
    
    return new Note(
      props.id || crypto.randomUUID(),
      props.userId,
      props.title,
      props.content,
      props.createdAt || now,
      props.updatedAt || now
    );
  }

  public updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date();
  }

  public updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }

  public update(title: string, content: string): void {
    this.title = title;
    this.content = content;
    this.updatedAt = new Date();
  }

  public toPlainObject() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
