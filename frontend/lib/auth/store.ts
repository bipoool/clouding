import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { signInWithPassword as serverSignInWithPassword, signUp as serverSignUp } from './actions'

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
        } catch (error: unknown) {
          throw error
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

      signInWithGoogle: async () => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }
        } catch (error: unknown) {
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signInWithGitHub: async () => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }
        } catch (error: unknown) {
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signInWithDiscord: async () => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }
        } catch (error: unknown) {
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        const supabase = createClient()
        set({ loading: true })
        
        // Cleanup subscription before signing out
        const { authSubscription } = get()
        if (authSubscription) {
          authSubscription()
          set({ authSubscription: null })
        }
        
        const { error } = await supabase.auth.signOut()
        if (error) {
          set({ loading: false })
          throw error
        }
        set({ user: null, session: null, loading: false })
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
            console.error('Error getting session:', error)
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
              if (process.env.NODE_ENV !== 'production') {
                console.log('Auth state changed:', event, session)
              }

              set({
                session,
                user: session?.user ?? null,
                loading: false,
              })

              // Handle different auth events
              if (event === 'SIGNED_IN') {
                // User signed in
              } else if (event === 'SIGNED_OUT') {
                // User signed out
              } else if (event === 'TOKEN_REFRESHED') {
                // Token was refreshed
              }
            }
          )

          // Store the subscription for cleanup
          set({ authSubscription: subscription.unsubscribe })
          
          return subscription
        } catch (error) {
          console.error('Error initializing auth:', error)
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