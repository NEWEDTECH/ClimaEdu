import { randomUUID } from "crypto";

interface TrailProps {
  id?: string;
  institutionId: string;
  title: string;
  description: string;
  courseIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Trail {
  private readonly _id: string;
  private readonly _institutionId: string;
  private _title: string;
  private _description: string;
  private _courseIds: string[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: TrailProps) {
    this._id = props.id ?? randomUUID();
    this._institutionId = props.institutionId;
    this._title = props.title;
    this._description = props.description;
    this._courseIds = props.courseIds;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: Omit<TrailProps, "createdAt" | "updatedAt">): Trail {
    return new Trail(props);
  }

  public static from(props: TrailProps): Trail {
    return new Trail(props);
  }

  public get id(): string {
    return this._id;
  }

  public get institutionId(): string {
    return this._institutionId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get courseIds(): string[] {
    return this._courseIds;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateTitle(newTitle: string): void {
    this._title = newTitle;
    this.touch();
  }

  public updateDescription(newDescription: string): void {
    this._description = newDescription;
    this.touch();
  }

  public addCourse(courseId: string): void {
    if (this._courseIds.includes(courseId)) {
      return;
    }
    this._courseIds.push(courseId);
    this.touch();
  }

  public removeCourse(courseId: string): void {
    this._courseIds = this._courseIds.filter((id) => id !== courseId);
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
