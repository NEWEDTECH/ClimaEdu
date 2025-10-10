import { injectable, inject } from 'inversify';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { AuthService } from '../services/AuthService';
import { auth } from '@/_core/shared/firebase/firebase-client';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { UserSymbols } from '@/_core/shared/container/symbols';

/**
 * Firebase implementation of the AuthService
 */
@injectable()
export class FirebaseAuthService implements AuthService {
  private currentUserId: string | null = null;
  private static instance: FirebaseAuthService | null = null;

  constructor(
    @inject(UserSymbols.repositories.UserRepository) private userRepository: UserRepository
  ) {
    // Singleton pattern to ensure only one instance of the service exists
    if (FirebaseAuthService.instance) {
      return FirebaseAuthService.instance;
    }

    FirebaseAuthService.instance = this;

    // Listen for auth state changes to keep currentUserId updated
    onAuthStateChanged(auth, (user) => {
      this.currentUserId = user ? user.uid : null;

      // Log auth state changes in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      }
    });
  }

  /**
   * Send a sign-in link to the user's email
   * @param email User email
   * @param redirectUrl URL to redirect after authentication
   * @returns Promise<void>
   * @throws Error if user does not exist in the database
   */
  async sendSignInLinkToEmail(email: string, redirectUrl: string): Promise<void> {
    try {
      console.log(`🚀 Starting sendSignInLinkToEmail for: ${email}`);
      
      const existingUser = await this.userRepository.findByEmail(email);

      if (!existingUser) {
        const errorMessage = `User with email ${email} does not exist in the database`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`✅ User found in database, proceeding to send sign-in link`);

      const actionCodeSettings = {
        url: redirectUrl,
        handleCodeInApp: true,
      };

      console.log(`📧 Sending email link to: ${email} with redirect: ${redirectUrl}`);
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
      }

      console.log(`✅ Sign-in link sent successfully to: ${email}`);
      console.log(`💾 Email saved to localStorage: ${email}`);
      
    } catch (error) {
      console.error('❌ Error sending sign-in link to email:', error);
      throw error;
    }
  }

  /**
   * Sign in with email link
   * @param email User email
   * @param link Sign-in link
   * @returns Promise with user ID if successful
   */
  async signInWithEmailLink(email: string, link: string): Promise<string> {
    try {
      console.log(`🚀 Attempting to sign in with email: ${email}`);
      console.log(`🔗 Link: ${link}`);

      // Check if the link is valid
      if (!this.isSignInWithEmailLink(link)) {
        throw new Error('Invalid sign-in link');
      }

      console.log(`✅ Link validation passed`);

      // Use standard Firebase email link authentication (works in both emulator and production)
      const result = await signInWithEmailLink(auth, email, link);

      // Clean up localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('emailForSignIn');
      }

      console.log(`✅ Successfully signed in user: ${result.user.uid}`);

      // Return the user ID (onAuthStateChanged will be triggered automatically)
      return result.user.uid;
    } catch (error) {
      console.error('❌ Error in signInWithEmailLink:', error);
      throw error;
    }
  }

  /**
   * Check if the current URL is a sign-in link
   * @param url URL to check
   * @returns boolean
   */
  isSignInWithEmailLink(url: string): boolean {
    const isValid = isSignInWithEmailLink(auth, url);

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Checking if URL is a sign-in link: ${url.substring(0, 100)}... - Result: ${isValid}`);
    }

    return isValid;
  }

  /**
   * Sign out the current user
   * @returns Promise<void>
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ User signed out successfully');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get the current user ID
   * @returns User ID or null if not authenticated
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Check if a user is currently authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return this.currentUserId !== null;
  }

  /**
   * Create a user with email and password in Firebase Authentication
   * @param email User email
   * @param password User password
   * @returns Promise with user ID if successful
   */
  async createUserWithEmailAndPassword(email: string, password: string): Promise<string> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error creating user with email and password:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   * @param email User email
   * @param password User password
   * @returns Promise with user ID if successful
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<string> {
    try {
      console.log(`🚀 Attempting to sign in with email and password: ${email}`);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log(`✅ Successfully signed in user: ${userCredential.user.uid}`);
      
      return userCredential.user.uid;
    } catch (error) {
      console.error('❌ Error signing in with email and password:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param email User email
   * @returns Promise<void>
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log(`📧 Sending password reset email to: ${email}`);
      
      await sendPasswordResetEmail(auth, email);
      
      console.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }
}
