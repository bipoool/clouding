'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, X, FileText } from 'lucide-react'
import type { Blueprint } from '@/hooks/useBlueprint'

const blueprintSchema = z.object({
	name: z.string().min(1, 'Blueprint name is required').max(100, 'Name too long'),
	description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
})

type BlueprintFormData = z.infer<typeof blueprintSchema>

interface EditBlueprintModalProps {
  blueprint: Blueprint | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: number, updates: { name: string; description: string }) => Promise<void>
}

export function EditBlueprintModal({ 
  blueprint, 
  isOpen, 
  onClose, 
  onSave 
}: EditBlueprintModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BlueprintFormData>({
    resolver: zodResolver(blueprintSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  // Update form when blueprint changes
  useEffect(() => {
    if (blueprint) {
      form.reset({
        name: blueprint.name || '',
        description: blueprint.description || '',
      })
    } else {
      form.reset({
        name: '',
        description: '',
      })
    }
  }, [blueprint, form])

  const handleSubmit = async (data: BlueprintFormData) => {
    if (!blueprint) return

    setIsSubmitting(true)

    try {
      await onSave(blueprint.id, {
        name: data.name.trim(),
        description: data.description.trim()
      })
      onClose()
    } catch (error) {
      logger.error('Failed to update blueprint:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-primary flex items-center gap-2'>
            <FileText className='h-5 w-5 text-blue-400' />
            Edit Blueprint
            {blueprint && (
              <span className="text-2xl ml-2">
                {blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 0 ? '🚀' : 
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 1 ? '⚡' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 2 ? '🔧' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 3 ? '🛠️' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 4 ? '⚙️' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 5 ? '🔨' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 6 ? '📦' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 7 ? '🎯' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 8 ? '🎪' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 9 ? '🎨' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 10 ? '🏗️' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 11 ? '🏢' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 12 ? '🏭' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 13 ? '🏪' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 14 ? '🏫' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 15 ? '🏬' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 16 ? '🏭' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 17 ? '🏯' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 18 ? '🏰' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 19 ? '💎' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 20 ? '💡' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 21 ? '🔮' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 22 ? '🎭' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 23 ? '🎪' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 24 ? '🎨' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 25 ? '🎬' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 26 ? '🎤' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 27 ? '🎧' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 28 ? '🎼' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 29 ? '🎹' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 30 ? '🎸' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 31 ? '🎺' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 32 ? '🎻' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 33 ? '🥁' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 34 ? '🎷' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 35 ? '🎺' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 36 ? '🎸' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 37 ? '🎻' :
                 blueprint.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 === 38 ? '🥁' :
                 '🎷'}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className='text-secondary'>
            Modify the name and description of your infrastructure blueprint.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-secondary'>Blueprint Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Web Application Stack'
                      className='glass-input'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className='text-xs text-gray-500'>
                    A descriptive name for this blueprint (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-secondary'>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe what this blueprint does...'
                      rows={3}
                      className='glass-input resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className='text-xs text-gray-500'>
                    Provide a detailed description of this blueprint's purpose (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => onClose()}
                className='flex-1 glass-btn'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 gradient-border-btn'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Update Blueprint
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
