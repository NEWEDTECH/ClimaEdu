/**
 * Interface for authentication service
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface AuthService {
  /**
   * Send a sign-in link to the user's email
   * @param email User email
   * @param redirectUrl URL to redirect after authentication
   * @returns Promise<void>
   */
  sendSignInLinkToEmail(email: string, redirectUrl: string): Promise<void>;

  /**
   * Sign in with email link
   * @param email User email
   * @param link Sign-in link
   * @returns Promise with user ID if successful
   */
  signInWithEmailLink(email: string, link: string): Promise<string>;

  /**
   * Check if the current URL is a sign-in link
   * @param url URL to check
   * @returns boolean
   */
  isSignInWithEmailLink(url: string): boolean;

  /**
   * Sign out the current user
   * @returns Promise<void>
   */
  signOut(): Promise<void>;

  /**
   * Get the current user ID
   * @returns User ID or null if not authenticated
   */
  getCurrentUserId(): string | null;

  /**
   * Check if a user is currently authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean;
}
