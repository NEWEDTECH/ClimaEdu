/**
 * Input data for removing a tutor from a course
 */
export class RemoveTutorFromCourseInput {
  constructor(
    public readonly userId: string,
    public readonly courseId: string
  ) {}
}
