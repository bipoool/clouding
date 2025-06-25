import React from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function SearchBar({
	value,
	onChange,
	placeholder = 'Search components...',
}: SearchBarProps) {
	return (
		<div className='relative'>
			<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
			<Input
				placeholder={placeholder}
				value={value}
				onChange={e => onChange(e.target.value)}
				className='pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-9'
			/>
		</div>
	)
}
