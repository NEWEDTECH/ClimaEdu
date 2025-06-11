export class RemoveEnrollmentFromClassInput {
  constructor(
    public readonly classId: string,
    public readonly enrollmentId: string
  ) {}
}
