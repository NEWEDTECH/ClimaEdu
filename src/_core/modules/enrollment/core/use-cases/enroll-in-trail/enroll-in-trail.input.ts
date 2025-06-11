export class EnrollInTrailInput {
  constructor(
    public readonly userId: string,
    public readonly trailId: string,
    public readonly institutionId: string
  ) {}
}
