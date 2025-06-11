export class AddCourseToTrailInput {
  constructor(
    public readonly trailId: string,
    public readonly courseId: string
  ) {}
}
