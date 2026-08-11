import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  confirmPasswordReset,
  verifyPasswordResetCode
} from '../config/firebase.js';
import { onAuthStateChanged, EmailAuthProvider, linkWithCredential, fetchSignInMethodsForEmail } from 'firebase/auth';
import API from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token and profile with our backend DB
  const syncWithBackend = async (firebaseUser, token, customDetails = {}) => {
    try {
      let localSolved = [];
      const savedUserStr = localStorage.getItem('interviewace_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.email !== firebaseUser.email) {
            console.log('[AUTH] Switch account detected! Clearing old local cache.');
            localStorage.removeItem('interviewace_solved_detail');
            localStorage.removeItem('interviewace_solved');
            localStorage.removeItem('interviewace_ats');
          }
        } catch (e) {}
      }

      try {
        const saved = localStorage.getItem('interviewace_solved_detail');
        if (saved) {
          localSolved = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error parsing local solved problems:', e);
      }

      const response = await API.post('/auth/sync', {
        firebaseId: firebaseUser.uid,
        email: firebaseUser.email,
        name: customDetails.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        role: customDetails.role || 'Student',
        targetRole: customDetails.targetRole || 'Frontend Engineer',
        localSolvedProblems: localSolved
      });

      const { token: jwtToken, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('interviewace_token', jwtToken);
      localStorage.setItem('interviewace_user', JSON.stringify(user));
      
      setUserProfile(user);
      return user;
    } catch (error) {
      console.error('Error syncing auth with database:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // In offline mock mode, check if we have a saved mock user in localStorage
      const savedUser = localStorage.getItem('interviewace_user');
      if (savedUser) {
        setUserProfile(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    // Subscribe to Firebase auth updates
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          setCurrentUser(firebaseUser);
          await syncWithBackend(firebaseUser, token);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          localStorage.removeItem('interviewace_token');
          localStorage.removeItem('interviewace_user');
        }
      } catch (err) {
        console.error('onAuthStateChanged sync error:', err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Standard Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          const token = await credential.user.getIdToken();
          const profile = await syncWithBackend(credential.user, token);
          return profile;
        } catch (error) {
          // Check if this is a Google-only account
          if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
              const methods = await fetchSignInMethodsForEmail(auth, email);
              if (methods.includes('google.com') && !methods.includes('password')) {
                const customErr = new Error('This email is registered via Google. Please log in using Google to link your password.');
                customErr.code = 'auth/google-only';
                customErr.email = email;
                customErr.password = password;
                throw customErr;
              }
            } catch (e) {
              if (e.code === 'auth/google-only') throw e;
              // Ignore email enumeration protection limitations/other errors, fall through to default throw
            }
          }
          throw error;
        }
      } else {
        // Offline Mock login
        const mockUid = `mock-uid-${email}`;
        const mockUser = { uid: mockUid, email, displayName: email.split('@')[0] };
        
        // Save mock token to bypass backend protect middleware
        const mockToken = `mock-token:${email}:${email.split('@')[0]}:Student:Frontend Engineer`;
        localStorage.setItem('interviewace_token', mockToken);
        
        const profile = await syncWithBackend(mockUser, mockToken);
        setCurrentUser(mockUser);
        return profile;
      }
    } catch (error) {
      console.error('Login action error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Standard Signup
  const signup = async (email, password, name, targetRole) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(credential.user, { displayName: name });
          const token = await credential.user.getIdToken();
          const profile = await syncWithBackend(credential.user, token, { name, targetRole });
          return profile;
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            try {
              const methods = await fetchSignInMethodsForEmail(auth, email);
              if (methods.includes('google.com') && !methods.includes('password')) {
                const customErr = new Error('This email is registered via Google. Please log in using Google to link your password.');
                customErr.code = 'auth/google-only';
                customErr.email = email;
                customErr.password = password;
                throw customErr;
              }
            } catch (e) {
              if (e.code === 'auth/google-only') throw e;
            }
          }
          throw error;
        }
      } else {
        // Offline Mock signup
        const mockUid = `mock-uid-${email}`;
        const mockUser = { uid: mockUid, email, displayName: name };
        
        const mockToken = `mock-token:${email}:${name}:Student:${targetRole}`;
        localStorage.setItem('interviewace_token', mockToken);

        const profile = await syncWithBackend(mockUser, mockToken, { name, targetRole });
        setCurrentUser(mockUser);
        return profile;
      }
    } catch (error) {
      console.error('Signup action error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google Single Sign-In
  const loginWithGoogle = async (pendingPassword = null) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const credential = await signInWithPopup(auth, googleProvider);

        // Link email/password credential if a pending password was provided
        if (pendingPassword && credential.user.email) {
          try {
            const emailCred = EmailAuthProvider.credential(credential.user.email, pendingPassword);
            await linkWithCredential(credential.user, emailCred);
            console.log('[AUTH] Successfully linked email/password to Google account.');
          } catch (linkErr) {
            console.warn('[AUTH] Error linking email/password:', linkErr.code || linkErr.message);
          }
        }

        const token = await credential.user.getIdToken();
        const profile = await syncWithBackend(credential.user, token);
        return profile;
      } else {
        // Offline Mock Google Sign-in
        const email = 'google_user@interviewace.ai';
        const name = 'Google Candidate';
        const mockUid = 'mock-google-uid-100';
        const mockUser = { uid: mockUid, email, displayName: name };

        const mockToken = `mock-token:${email}:${name}:Student:Frontend Engineer`;
        localStorage.setItem('interviewace_token', mockToken);

        const profile = await syncWithBackend(mockUser, mockToken, { name });
        setCurrentUser(mockUser);
        return profile;
      }
    } catch (error) {
      console.error('Google Auth login error:', error.message);
      // Surface a clear message for network-level failures
      if (error.isNetworkError || error.code === 'ERR_NETWORK') {
        const netErr = new Error('Network error: Cannot reach the server. Please ensure the backend is running and try again.');
        netErr.code = 'ERR_NETWORK';
        throw netErr;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    if (isFirebaseConfigured) {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      return await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } else {
      console.log(`[MOCK RESET PASSWORD] Sent reset instruction to ${email}`);
      return true;
    }
  };

  // Verify reset code (Firebase or Mock)
  const verifyResetCode = async (oobCode) => {
    if (isFirebaseConfigured && oobCode) {
      return await verifyPasswordResetCode(auth, oobCode);
    }
    return 'candidate@interviewace.ai';
  };

  // Confirm password reset (Firebase or Mock)
  const confirmResetPassword = async (oobCode, newPassword, mockEmail = null) => {
    if (isFirebaseConfigured && oobCode) {
      return await confirmPasswordReset(auth, oobCode, newPassword);
    } else {
      console.log(`[MOCK RESET PASSWORD] Password updated successfully for ${mockEmail || 'candidate'}`);
      return true;
    }
  };

  // Sign out
  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
      localStorage.removeItem('interviewace_token');
      localStorage.removeItem('interviewace_user');
      localStorage.removeItem('interviewace_solved_detail');
      localStorage.removeItem('interviewace_solved');
      localStorage.removeItem('interviewace_ats');
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfileDetails = async (updates) => {
    try {
      const response = await API.put('/auth/profile', updates);
      setUserProfile(response.data);
      localStorage.setItem('interviewace_user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Update profile detail error:', error.message);
      throw error;
    }
  };

  // Refresh user profile details
  const refreshUserProfile = async () => {
    try {
      const response = await API.get('/auth/profile');
      setUserProfile(response.data);
      localStorage.setItem('interviewace_user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Refresh profile error:', error.message);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    signup,
    loginWithGoogle,
    resetPassword,
    verifyResetCode,
    confirmResetPassword,
    logout,
    updateProfileDetails,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
