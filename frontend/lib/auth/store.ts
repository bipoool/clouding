import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { signInWithPassword as serverSignInWithPassword, signUp as serverSignUp } from './actions'
import { logger } from '@/lib/utils/logger'

// Types for the auth store
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  authSubscription: (() => void) | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setAuthSubscription: (subscription: (() => void) | null) => void
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  cleanup: () => void
}

type AuthStore = AuthState & AuthActions

// Create the Zustand store
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // State
      user: null,
      session: null,
      loading: true,
      initialized: false,
      authSubscription: null,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      setAuthSubscription: (subscription) => set({ authSubscription: subscription }),

      signInWithPassword: async (email: string, password: string) => {
        set({ loading: true })
        try {
          await serverSignInWithPassword(email, password)
          // The session will be updated through the auth listener
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (email: string, password: string) => {
        set({ loading: true })
        try {
          await serverSignUp(email, password)
          set({ loading: false })
        } catch (error: unknown) {
          set({ loading: false })
          throw error
        }
      },

      // Reusable OAuth sign-in function
      signInWithOAuth: async (provider: 'google' | 'github' | 'discord') => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }
        } finally {
          set({ loading: false })
        }
      },

      signInWithGoogle: async () => {
        return get().signInWithOAuth('google')
      },

      signInWithGitHub: async () => {
        return get().signInWithOAuth('github')
      },

      signInWithDiscord: async () => {
        return get().signInWithOAuth('discord')
      },

      signOut: async () => {
        set({ loading: true })
        
        try {
          // Cleanup subscription before signing out
          const { authSubscription } = get()
          if (authSubscription) {
            authSubscription()
            set({ authSubscription: null })
          }
          
          // Create client instance
          const supabase = createClient()
          
          try {
            // Call server-side logout API for proper session cleanup
            const response = await fetch('/auth/logout', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            
            // Don't throw error if server logout fails, continue with client logout
            if (!response.ok) {
              logger.warn('Server-side logout failed, continuing with client-side logout')
            }
          } catch (serverError) {
            logger.warn('Server-side logout request failed:', serverError)
            // Continue with client-side logout
          }
          
          // Always attempt client-side logout
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            logger.error('Error signing out from client:', error)
            // Continue with cleanup even if client logout fails
          }
          
          // Clear local state regardless of API results
          set({ 
            user: null, 
            session: null, 
            loading: false 
          })
          
          // Use window.location for a full page reload to ensure clean state
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        } catch (error: unknown) {
          logger.error('Error during sign out:', error)
          
          // Even if there's an error, clear the local state
          set({ 
            user: null, 
            session: null, 
            loading: false 
          })
          
          // Still redirect to home page
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
          
          throw error
        }
      },

      cleanup: () => {
        const { authSubscription } = get()
        if (authSubscription) {
          authSubscription()
          set({ authSubscription: null })
        }
      },

      initialize: async () => {
        const supabase = createClient()
        
        try {
          // Cleanup any existing subscription
          const { authSubscription } = get()
          if (authSubscription) {
            authSubscription()
          }

          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            logger.error('Error getting session:', error)
          }

          set({
            session,
            user: session?.user ?? null,
            loading: false,
            initialized: true,
          })

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              // Only log in development environment
              logger.log('Auth state changed:', event, session)

              set({
                session,
                user: session?.user ?? null,
                loading: false,
              })

              // Handle different auth events
              if (event === 'SIGNED_IN') {
                // User signed in - could trigger additional actions
                logger.log('User signed in')
              } else if (event === 'SIGNED_OUT') {
                // User signed out - ensure clean state
                logger.log('User signed out')
                set({ 
                  user: null, 
                  session: null, 
                  loading: false 
                })
              } else if (event === 'TOKEN_REFRESHED') {
                // Token was refreshed - update session
                logger.log('Token refreshed')
              }
            }
          )

          // Store the subscription for cleanup
          set({ authSubscription: subscription.unsubscribe })
          
          return subscription
        } catch (error) {
          logger.error('Error initializing auth:', error)
          set({ loading: false, initialized: true })
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
)

// Selectors for easy access to specific parts of the state
export const useUser = () => useAuthStore((state) => state.user)
export const useSession = () => useAuthStore((state) => state.session)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useAuthInitialized = () => useAuthStore((state) => state.initialized)

// Initialize the auth store
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
} 