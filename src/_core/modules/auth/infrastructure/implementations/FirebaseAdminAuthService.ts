/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'inversify';
import { AuthService } from '../services/AuthService';
import { getAdminAuth, initializeFirebaseAdmin } from '@/_core/shared/firebase/firebase-admin';

/**
 * Firebase Admin implementation of the AuthService for server-side operations
 */
@injectable()
export class FirebaseAdminAuthService implements AuthService {
  constructor() {
    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin();
  }

  /**
   * Send a sign-in link to the user's email
   * Not implemented for admin service as it's typically used client-side
   */
  async sendSignInLinkToEmail(email: string, redirectUrl: string): Promise<void> {
    throw new Error('sendSignInLinkToEmail is not supported in server-side context');
  }

  /**
   * Sign in with email link
   * Not implemented for admin service as it's typically used client-side
   */
  async signInWithEmailLink(email: string, link: string): Promise<string> {
    throw new Error('signInWithEmailLink is not supported in server-side context');
  }

  /**
   * Check if the current URL is a sign-in link
   * Not implemented for admin service as it's typically used client-side
   */
  isSignInWithEmailLink(url: string): boolean {
    throw new Error('isSignInWithEmailLink is not supported in server-side context');
  }

  /**
   * Sign out the current user
   * Not implemented for admin service as it's typically used client-side
   */
  async signOut(): Promise<void> {
    throw new Error('signOut is not supported in server-side context');
  }

  /**
   * Get the current user ID
   * Not applicable for admin service as there's no "current user" in server context
   */
  getCurrentUserId(): string | null {
    return null;
  }

  /**
   * Check if a user is currently authenticated
   * Not applicable for admin service as there's no "current user" in server context
   */
  isAuthenticated(): boolean {
    return false;
  }

  /**
   * Create a user with email and password in Firebase Authentication
   * @param email User email
   * @param password User password
   * @returns Promise with user ID if successful
   */
  async createUserWithEmailAndPassword(email: string, password: string): Promise<string> {
    try {
      const adminAuth = getAdminAuth();
      
      const userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: false,
      });

      return userRecord.uid;
    } catch (error) {
      console.error('Error creating user with Firebase Admin:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   * Not implemented for admin service as authentication is handled client-side
   * @param email User email
   * @param password User password
   * @returns Promise with user ID if successful
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<string> {
    throw new Error('signInWithEmailAndPassword is not supported in server-side context');
  }

  /**
   * Send password reset email using Firebase Admin SDK
   * @param email User email
   * @returns Promise<void>
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const adminAuth = getAdminAuth();
      
      console.log(`📧 Generating password reset link for: ${email}`);
      
      // Generate password reset link using Admin SDK
      const link = await adminAuth.generatePasswordResetLink(email);
      
      console.log(`✅ Password reset link generated for: ${email}`);
      console.log(`🔗 Link: ${link}`);
      
      // Note: In a real implementation, you would send this link via your email service
      // For now, we just log it. The client-side implementation (FirebaseAuthService) 
      // handles actual email sending via Firebase Authentication
      
    } catch (error) {
      console.error('❌ Error generating password reset link:', error);
      throw error;
    }
  }
}
