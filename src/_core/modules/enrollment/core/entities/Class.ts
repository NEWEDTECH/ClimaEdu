import { randomUUID } from "crypto";

interface ClassProps {
  id?: string;
  institutionId: string;
  name: string;
  courseId?: string | null;
  trailId?: string | null;
  enrollmentIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Class {
  private readonly _id: string;
  private readonly _institutionId: string;
  private _name: string;
  private _courseId: string | null;
  private _trailId: string | null;
  private _enrollmentIds: string[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ClassProps) {
    this._id = props.id ?? randomUUID();
    this._institutionId = props.institutionId;
    this._name = props.name;
    this._courseId = props.courseId ?? null;
    this._trailId = props.trailId ?? null;
    this._enrollmentIds = props.enrollmentIds;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    if (!this._courseId && !this._trailId) {
      throw new Error("A class must be associated with a course or a trail.");
    }

    if (this._courseId && this._trailId) {
      throw new Error(
        "A class cannot be associated with both a course and a trail."
      );
    }
  }

  public static create(
    props: Omit<ClassProps, "createdAt" | "updatedAt">
  ): Class {
    return new Class(props);
  }

  public static from(props: ClassProps): Class {
    return new Class(props);
  }

  public get id(): string {
    return this._id;
  }

  public get institutionId(): string {
    return this._institutionId;
  }

  public get name(): string {
    return this._name;
  }

  public get courseId(): string | null {
    return this._courseId;
  }

  public get trailId(): string | null {
    return this._trailId;
  }

  public get enrollmentIds(): string[] {
    return this._enrollmentIds;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateName(newName: string): void {
    this._name = newName;
    this.touch();
  }

  public addEnrollment(enrollmentId: string): void {
    if (this._enrollmentIds.includes(enrollmentId)) {
      return;
    }
    this._enrollmentIds.push(enrollmentId);
    this.touch();
  }

  public removeEnrollment(enrollmentId: string): void {
    this._enrollmentIds = this._enrollmentIds.filter(
      (id) => id !== enrollmentId
    );
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
