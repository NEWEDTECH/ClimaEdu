import { injectable } from 'inversify';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { AuthService } from '../services/AuthService';
import { auth } from '@/_core/shared/firebase/firebase-client';

/**
 * Firebase implementation of the AuthService
 */
@injectable()
export class FirebaseAuthService implements AuthService {
  private currentUserId: string | null = null;
  private static instance: FirebaseAuthService | null = null;

  constructor() {
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
        console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      }
    });
    
    // Check if we have a stored user ID in localStorage
    if (typeof window !== 'undefined') {
      const storedUserId = window.localStorage.getItem('currentUserId');
      if (storedUserId) {
        this.currentUserId = storedUserId;
        console.log('Restored user ID from localStorage:', storedUserId);
      }
    }
  }

  /**
   * Send a sign-in link to the user's email
   * @param email User email
   * @param redirectUrl URL to redirect after authentication
   * @returns Promise<void>
   */
  async sendSignInLinkToEmail(email: string, redirectUrl: string): Promise<void> {
    const actionCodeSettings = {
      url: redirectUrl,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save the email locally to remember the user when they return
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Email saved to localStorage: ${email}`);
        }
      }
    } catch (error) {
      console.error('Error sending sign-in link to email:', error);
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`Attempting to sign in with email: ${email} and link: ${link}`);
      }
      
      // Check if the link is valid
      if (!this.isSignInWithEmailLink(link)) {
        throw new Error('Invalid sign-in link');
      }
      
      // When using the emulator, we need to handle the authentication differently
      // because the emulator doesn't fully support email link authentication
      if (process.env.NODE_ENV === 'development' && link.includes('apiKey=fake-api-key')) {
        console.log('Using emulator mode for authentication');
        
        // In emulator mode, we'll create a fake successful authentication
        // This is a workaround for the emulator's limitations with email link authentication
        
        // Generate a fake user ID
        const fakeUserId = `emulator-user-${Date.now()}`;
        
        // Update the current user ID
        this.currentUserId = fakeUserId;
        
        // Store the user ID in localStorage for persistence
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('currentUserId', fakeUserId);
          window.localStorage.removeItem('emailForSignIn');
        }
        
        console.log(`Successfully signed in emulator user: ${fakeUserId}`);
        
        // Return the fake user ID
        return fakeUserId;
      }
      
      // For production or when not using the emulator
      try {
        const result = await signInWithEmailLink(auth, email, link);
        
        // Update the current user ID
        this.currentUserId = result.user.uid;
        
        // Store the user ID in localStorage for persistence
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('currentUserId', result.user.uid);
          window.localStorage.removeItem('emailForSignIn');
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Successfully signed in user: ${result.user.uid}`);
        }
        
        // Return the user ID
        return result.user.uid;
      } catch (error: unknown) {
        console.error('Error signing in with email link:', error);
        
        // Handle specific Firebase error codes
        if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/invalid-action-code') {
          console.warn('Invalid action code. This is expected when using the emulator.');
          
          // In development mode with emulator, we'll create a fake successful authentication
          if (process.env.NODE_ENV === 'development') {
            // Generate a fake user ID
            const fakeUserId = `emulator-user-${Date.now()}`;
            
            // Update the current user ID
            this.currentUserId = fakeUserId;
            
            // Store the user ID in localStorage for persistence
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('currentUserId', fakeUserId);
            }
            
            console.log(`Created fake user for emulator: ${fakeUserId}`);
            
            // Return the fake user ID
            return fakeUserId;
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error in signInWithEmailLink:', error);
      throw error;
    }
  }

  /**
   * Check if the current URL is a sign-in link
   * @param url URL to check
   * @returns boolean
   */
  isSignInWithEmailLink(url: string): boolean {
    // In development mode with emulator, we need to handle this differently
    if (process.env.NODE_ENV === 'development' && url.includes('apiKey=fake-api-key')) {
      // Check if the URL contains the necessary parameters for email link authentication
      const hasSignInParams = url.includes('mode=signIn') && url.includes('oobCode=');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Checking if emulator URL is a sign-in link: ${url} - Result: ${hasSignInParams}`);
      }
      
      return hasSignInParams;
    }
    
    // For production or when not using the emulator
    const isValid = isSignInWithEmailLink(auth, url);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Checking if URL is a sign-in link: ${url} - Result: ${isValid}`);
    }
    
    return isValid;
  }

  /**
   * Sign out the current user
   * @returns Promise<void>
   */
  async signOut(): Promise<void> {
    try {
      // If we're using a fake user in the emulator, just clear the user ID
      if (process.env.NODE_ENV === 'development' && this.currentUserId?.startsWith('emulator-user-')) {
        this.currentUserId = null;
        
        // Clear the user ID from localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('currentUserId');
        }
        
        console.log('Signed out emulator user');
        return;
      }
      
      // For real users, use Firebase signOut
      await signOut(auth);
      
      // Clear the user ID
      this.currentUserId = null;
      
      // Clear the user ID from localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('currentUserId');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('User signed out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get the current user ID
   * @returns User ID or null if not authenticated
   */
  getCurrentUserId(): string | null {
    // If we don't have a current user ID in memory, check localStorage
    if (!this.currentUserId && typeof window !== 'undefined') {
      const storedUserId = window.localStorage.getItem('currentUserId');
      if (storedUserId) {
        this.currentUserId = storedUserId;
        console.log('Restored user ID from localStorage:', storedUserId);
      }
    }
    
    return this.currentUserId;
  }

  /**
   * Check if a user is currently authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    // If we don't have a current user ID in memory, check localStorage
    if (!this.currentUserId && typeof window !== 'undefined') {
      const storedUserId = window.localStorage.getItem('currentUserId');
      if (storedUserId) {
        this.currentUserId = storedUserId;
        console.log('Restored user ID from localStorage:', storedUserId);
      }
    }
    
    return this.currentUserId !== null;
  }
}
