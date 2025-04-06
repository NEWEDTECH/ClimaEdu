/**
 * Input data for sending a sign-in link
 */
export interface SendSignInLinkInput {
  /**
   * User email
   */
  email: string;
  
  /**
   * URL to redirect after authentication
   */
  redirectUrl: string;
}
