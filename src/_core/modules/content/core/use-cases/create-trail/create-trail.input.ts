export class CreateTrailInput {
  constructor(
    public readonly institutionId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly courseIds: string[],
    public readonly coverImageUrl?: string | null
  ) {}
}
