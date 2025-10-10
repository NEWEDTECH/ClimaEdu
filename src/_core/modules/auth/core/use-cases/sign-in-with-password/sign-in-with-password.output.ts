export class SignInWithPasswordOutput {
  constructor(
    public readonly userId: string,
    public readonly success: boolean
  ) {}
}
