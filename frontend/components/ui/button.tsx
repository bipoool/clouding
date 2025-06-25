import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'gradient-border-btn text-white',
        destructive:
          'gradient-border-btn text-red-300 [&::before]:bg-gradient-to-r [&::before]:from-red-500 [&::before]:to-pink-500',
        outline: 'gradient-border-btn-outline text-white',
        secondary:
          'gradient-border-btn text-purple-300 [&::before]:bg-gradient-to-r [&::before]:from-purple-500 [&::before]:to-indigo-500',
        ghost:
          'hover:bg-white/10 hover:text-primary backdrop-blur-sm text-white/80 hover:text-white hover:scale-103 transition-all duration-300',
        link: 'text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 hover:scale-103 transition-all duration-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
