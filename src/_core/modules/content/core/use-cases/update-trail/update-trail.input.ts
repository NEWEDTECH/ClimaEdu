export class UpdateTrailInput {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly courseIds?: string[],
    public readonly coverImageUrl?: string | null
  ) {}
}
