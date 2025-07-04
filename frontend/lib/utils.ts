import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extracts an error message from an unknown error type
 * @param error - The unknown error to extract a message from
 * @param fallbackMessage - The fallback message to use if no message can be extracted
 * @returns A string error message
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return fallbackMessage
}
