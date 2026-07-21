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
  signInWithPopup
} from '../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
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
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const token = await credential.user.getIdToken();
        const profile = await syncWithBackend(credential.user, token);
        return profile;
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
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        const token = await credential.user.getIdToken();
        const profile = await syncWithBackend(credential.user, token, { name, targetRole });
        return profile;
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
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const credential = await signInWithPopup(auth, googleProvider);
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    if (isFirebaseConfigured) {
      return await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`[MOCK RESET PASSWORD] Sent reset instruction to ${email}`);
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
