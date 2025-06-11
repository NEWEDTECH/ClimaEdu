export class AddEnrollmentToClassInput {
  constructor(
    public readonly classId: string,
    public readonly enrollmentId: string
  ) {}
}
