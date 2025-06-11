export class CreateClassInput {
  constructor(
    public readonly institutionId: string,
    public readonly name: string,
    public readonly courseId?: string,
    public readonly trailId?: string
  ) {}
}
