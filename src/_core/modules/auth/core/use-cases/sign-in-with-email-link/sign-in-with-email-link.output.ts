/**
 * Output data for signing in with an email link
 */
export interface SignInWithEmailLinkOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * User ID if successful, null otherwise
   */
  userId: string | null;
}
