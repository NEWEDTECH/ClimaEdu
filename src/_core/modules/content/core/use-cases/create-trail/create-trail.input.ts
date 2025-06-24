export class CreateTrailInput {
  constructor(
    public readonly institutionId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly courseIds: string[]
  ) {}
}
