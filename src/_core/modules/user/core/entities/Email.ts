/**
 * Email value object representing a valid email address
 * Following Clean Architecture principles, this value object is pure and has no dependencies on infrastructure
 */
export class Email {
  private constructor(public value: string) {}

  /**
   * Creates a new Email instance after validating the email format
   * @param value The email string to validate
   * @returns A new Email instance
   * @throws Error if the email format is invalid
   */
  public static create(value: string): Email {
    if (!Email.isValidFormat(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
    return new Email(value);
  }

  /**
   * Validates if the provided string is in a valid email format
   * @param email The email string to validate
   * @returns True if the email format is valid, false otherwise
   */
  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Checks if the email is valid
   * @returns True if the email is valid, false otherwise
   */
  public isValid(): boolean {
    return Email.isValidFormat(this.value);
  }

  /**
   * Normalizes the email value (lowercase and trimmed)
   */
  public normalize(): void {
    this.value = this.value.toLowerCase().trim();
  }
}
