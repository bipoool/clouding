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
}

interface AuthActions {
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

// Create the Zustand store
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      // State
      user: null,
      session: null,
      loading: true,
      initialized: false,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      signInWithPassword: async (email: string, password: string) => {
        set({ loading: true })
        try {
          await serverSignInWithPassword(email, password)
          // The session will be updated through the auth listener
        } catch (error: unknown) {
          set({ loading: false })
          throw error
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
      },

      signInWithGitHub: async () => {
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
      },

      signInWithDiscord: async () => {
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
      },

      signOut: async () => {
        const supabase = createClient()
        set({ loading: true })
        const { error } = await supabase.auth.signOut()
        if (error) {
          set({ loading: false })
          throw error
        }
        set({ user: null, session: null, loading: false })
      },

      initialize: async () => {
        const supabase = createClient()
        
        try {
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
              console.log('Auth state changed:', event, session)

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

          // Store the subscription for cleanup if needed
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