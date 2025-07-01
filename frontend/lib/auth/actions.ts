'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  // Check if fields exist and are strings
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    redirect('/auth?error=missing_fields')
  }

  // Trim whitespace
  const trimmedEmail = email.trim()
  const trimmedPassword = password.trim()

  // Check if fields are non-empty after trimming
  if (!trimmedEmail || !trimmedPassword) {
    redirect('/auth?error=missing_fields')
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    redirect('/auth?error=invalid_email')
  }

  const data = {
    email: trimmedEmail,
    password: trimmedPassword,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth?error=invalid_credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  // Check if fields exist and are strings
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    redirect('/auth?error=missing_fields')
  }

  // Trim whitespace
  const trimmedEmail = email.trim()
  const trimmedPassword = password.trim()

  // Check if fields are non-empty after trimming
  if (!trimmedEmail || !trimmedPassword) {
    redirect('/auth?error=missing_fields')
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    redirect('/auth?error=invalid_email')
  }

  const data = {
    email: trimmedEmail,
    password: trimmedPassword,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth?error=signup_failed')
  }

  revalidatePath('/', 'layout')
  redirect('/auth?message=check_email')
}

// Functions for Zustand store
export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  revalidatePath('/', 'layout')
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  revalidatePath('/', 'layout')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
} 