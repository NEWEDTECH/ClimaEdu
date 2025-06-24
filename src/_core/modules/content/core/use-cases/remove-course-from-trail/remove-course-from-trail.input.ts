export class RemoveCourseFromTrailInput {
  constructor(
    public readonly trailId: string,
    public readonly courseId: string
  ) {}
}
