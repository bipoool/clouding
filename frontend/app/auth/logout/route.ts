import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      		logger.error('Error signing out:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Revalidate all paths to clear cached data
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  	} catch (error) {
		logger.error('Unexpected error during sign out:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    )
  }
} 