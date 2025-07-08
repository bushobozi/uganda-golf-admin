import { defineStore } from "pinia";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/firebase";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as import("firebase/auth").User | null,
    loading: true,
    error: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    getUser: (state) => state.user,
    isLoading: (state) => state.loading,
  },

  actions: {
    // Initialize auth state listener
    initializeAuth() {
      if (this.initialized) {
        return Promise.resolve(this.user);
      }

      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          this.user = user;
          this.loading = false;
          this.initialized = true;
          resolve(user);
        });
      });
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
      try {
        this.loading = true;
        this.error = null;
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        
        return userCredential.user;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Sign up with email and password
    async signUp(email: string, password: string, displayName: string | null = null) {
      try {
        this.loading = true;
        this.error = null;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name if provided
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        
        this.user = userCredential.user;
        return userCredential.user;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Sign out
    async signOut() {
      try {
        this.loading = true;
        await signOut(auth);
        this.user = null;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Password reset
    async resetPassword(email: string) {
      try {
        this.loading = true;
        this.error = null;
        
        await sendPasswordResetEmail(auth, email);
        
        return true;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});