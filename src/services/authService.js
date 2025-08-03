import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  getAuth
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ERROR_MESSAGES } from '../constants';

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user data (name, etc.)
   * @returns {Promise<object>} - User data or error
   */
  async register(email, password, userData = {}) {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with additional data
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName,
          photoURL: userData.photoURL || null
        });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName || null,
          photoURL: userData.photoURL || null,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error codes
      let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        default:
          errorMessage = error.message || ERROR_MESSAGES.GENERIC_ERROR;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} - User data or error
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error codes
      let errorMessage = ERROR_MESSAGES.AUTHENTICATION_FAILED;
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
          break;
        default:
          errorMessage = error.message || ERROR_MESSAGES.AUTHENTICATION_FAILED;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Logout current user
   * @returns {Promise<object>} - Success or error
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Failed to log out. Please try again.'
      };
    }
  }
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<object>} - Success or error
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Update user profile
   * @param {object} userData - User data to update
   * @returns {Promise<object>} - Success or error
   */
  async updateUserProfile(userData) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found. Please log in again.'
        };
      }
      
      await updateProfile(user, {
        displayName: userData.displayName || user.displayName,
        photoURL: userData.photoURL || user.photoURL
      });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName || user.displayName,
          photoURL: userData.photoURL || user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile. Please try again.'
      };
    }
  }
  
  /**
   * Update user email
   * @param {string} newEmail - New email address
   * @param {string} password - Current password for verification
   * @returns {Promise<object>} - Success or error
   */
  async updateUserEmail(newEmail, password) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found. Please log in again.'
        };
      }
      
      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Send verification email
      await sendEmailVerification(user);
      
      return {
        success: true,
        message: 'Email updated successfully. Please verify your new email address.'
      };
    } catch (error) {
      console.error('Update email error:', error);
      
      let errorMessage = 'Failed to update email. Please try again.';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'This operation requires recent authentication. Please log in again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use by another account.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Update user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<object>} - Success or error
   */
  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found. Please log in again.'
        };
      }
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return {
        success: true,
        message: 'Password updated successfully.'
      };
    } catch (error) {
      console.error('Update password error:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'This operation requires recent authentication. Please log in again.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect current password. Please try again.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get current authenticated user
   * @returns {object|null} - Current user or null
   */
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();
