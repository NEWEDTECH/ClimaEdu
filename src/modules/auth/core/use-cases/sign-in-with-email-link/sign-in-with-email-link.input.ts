/**
 * Input data for signing in with an email link
 */
export interface SignInWithEmailLinkInput {
  /**
   * User email
   */
  email: string;
  
  /**
   * Sign-in link
   */
  link: string;
}
