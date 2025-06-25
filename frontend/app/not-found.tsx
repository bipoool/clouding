import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='min-h-screen gradient-bg noise-overlay flex items-center justify-center p-6'>
      <div className='glass-card max-w-2xl mx-auto text-center'>
        {/* ASCII Art 404 */}
        <div className='mb-8 font-mono text-cyan-400 text-sm md:text-base overflow-x-auto'>
          <pre className='whitespace-pre'>
            {`
 ██╗  ██╗ ██████╗ ██╗  ██╗
 ██║  ██║██╔═████╗██║  ██║
 ███████║██║██╔██║███████║
 ╚════██║████╔╝██║╚════██║
      ██║╚██████╔╝     ██║
      ╚═╝ ╚═════╝      ╚═╝
`}
          </pre>
        </div>

        <h1 className='text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent'>
          404
        </h1>

        <h2 className='text-2xl font-bold text-white mb-4'>
          Infrastructure Not Found
        </h2>

        <p className='text-lg text-gray-300 mb-8 leading-relaxed'>
          The infrastructure for this page does not exist.
          <br />
          <span className='font-mono text-cyan-400'>
            {'// TODO: Deploy missing resources'}
          </span>
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/dashboard'>
            <Button className='bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold animate-glow'>
              <Home className='h-4 w-4 mr-2' />
              Return to Dashboard
            </Button>
          </Link>

          <Link href='/'>
            <Button
              variant='outline'
              className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Debug Info */}
        <div className='mt-12 p-4 bg-white/5 border border-white/10 rounded-lg text-left'>
          <div className='font-mono text-sm text-gray-400'>
            <div className='text-cyan-400 mb-2'>{'// Debug Information'}</div>
            <div>Status: 404 - Not Found</div>
            <div>Timestamp: {new Date().toISOString()}</div>
            <div>User-Agent: Browser</div>
            <div className='text-purple-400 mt-2'>
              {'// Suggested Actions:'}
            </div>
            <div>1. Check the URL for typos</div>
            <div>2. Navigate using the menu</div>
            <div>3. Contact support if the issue persists</div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000'></div>
      </div>
    </div>
  )
}
