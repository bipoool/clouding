'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
	User,
	Key,
	Palette,
	Trash2,
	Save,
	Mail,
	Calendar,
	Shield,
} from 'lucide-react'
import { useUser, useAuthLoading } from '@/lib/auth/store'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/date'
import { logger } from '@/lib/utils/logger'

export default function SettingsPage() {
	const user = useUser()
	const loading = useAuthLoading()
	const [darkMode, setDarkMode] = useState(true)
	const [notifications, setNotifications] = useState(true)
	const [profileData, setProfileData] = useState({
		name: '',
		email: '',
	})
	const [passwords, setPasswords] = useState({
		current: '',
		new: '',
		confirm: '',
	})

	// Initialize profile data when user loads
	useEffect(() => {
		if (user) {
			setProfileData({
				name: user.user_metadata?.full_name || '',
				email: user.email || '',
			})
		}
	}, [user])

	const handleSaveProfile = async () => {
		try {
			// Here you would typically update user metadata via Supabase
			// For now, we'll just show a success message
			toast.success('Profile updated successfully!')
		} catch (error) {
			toast.error('Failed to update profile')
			logger.error('Error updating profile:', error)
		}
	}

	const handleUpdatePassword = async () => {
		if (!passwords.current || !passwords.new || !passwords.confirm) {
			toast.error('Please fill in all password fields')
			return
		}

		if (passwords.new !== passwords.confirm) {
			toast.error('New passwords do not match')
			return
		}

		if (passwords.new.length < 6) {
			toast.error('Password must be at least 6 characters')
			return
		}

		try {
			// Here you would typically update password via Supabase
			//TODO: Implement Password Update
			toast.success('Password updated successfully!')
			setPasswords({ current: '', new: '', confirm: '' })
		} catch (error) {
			toast.error('Failed to update password')
			logger.error('Error updating password:', error)
		}
	}

	if (loading) {
		return (
			<DashboardLayout>
				<div className='max-w-4xl mx-auto space-y-8'>
					<div className='space-y-2'>
						<Skeleton className='h-8 w-48' />
						<Skeleton className='h-4 w-64' />
					</div>
					<Skeleton className='h-96 w-full rounded-lg' />
					<Skeleton className='h-64 w-full rounded-lg' />
				</div>
			</DashboardLayout>
		)
	}

	if (!user) {
		return (
			<DashboardLayout>
				<div className='max-w-4xl mx-auto'>
					<div className='glass-card border-red-500/20 p-6'>
						<div className='text-center text-red-400'>
							<Shield className='h-12 w-12 mx-auto mb-4' />
							<h2 className='text-xl font-semibold mb-2'>
								Authentication Required
							</h2>
							<p className='text-gray-400'>
								Please sign in to access settings.
							</p>
						</div>
					</div>
				</div>
			</DashboardLayout>
		)
	}

	return (
		<DashboardLayout>
			<div className='max-w-4xl mx-auto space-y-8'>
				<div>
					<h1 className='text-2xl font-bold text-white'>Account Settings</h1>
					<p className='text-gray-400'>
						Manage your account preferences and security settings
					</p>
				</div>

				{/* Current User Info */}
				<div className='glass-card space-y-4'>
					<div className='flex items-center gap-4'>
						<Avatar className='h-16 w-16 border-2 border-accent-cyan/30'>
							<AvatarImage
								src={user.user_metadata?.avatar_url}
								alt={profileData.name || user.email || 'User'}
							/>
							<AvatarFallback className='bg-accent-cyan/10 text-accent-cyan text-lg'>
								{(profileData.name || user.email || 'U')
									.charAt(0)
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='flex-1'>
							<h3 className='text-xl font-semibold text-white'>
								{profileData.name || 'Anonymous User'}
							</h3>
							<div className='flex items-center gap-2 mt-1'>
								<Mail className='h-4 w-4 text-gray-400' />
								<span className='text-gray-400'>{user.email}</span>
								{user.email_confirmed_at && (
									<Badge
										variant='secondary'
										className='bg-green-500/20 text-green-400 border-green-500/30'
									>
										Verified
									</Badge>
								)}
							</div>
							<div className='flex items-center gap-2 mt-1'>
								<Calendar className='h-4 w-4 text-gray-400' />
								<span className='text-gray-400 text-sm'>
									Member since{' '}
									{user.created_at ? formatDate(user.created_at) : 'Unknown'}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Profile Settings */}
				<div className='glass-card space-y-6'>
					<div className='flex items-center gap-3'>
						<User className='h-5 w-5 text-cyan-400' />
						<h2 className='text-lg font-semibold text-white'>
							Profile Information
						</h2>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='name' className='text-gray-300'>
								Full Name
							</Label>
							<Input
								id='name'
								value={profileData.name}
								onChange={e =>
									setProfileData(prev => ({ ...prev, name: e.target.value }))
								}
								placeholder='Enter your full name'
								className='glow-border bg-white/5 border-white/10 text-white'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='email' className='text-gray-300'>
								Email Address
							</Label>
							<Input
								id='email'
								type='email'
								value={profileData.email}
								className='glow-border bg-white/5 border-white/10 text-white'
								readOnly
								title='Email cannot be changed from settings'
							/>
							<p className='text-xs text-gray-500'>
								Email address cannot be changed from settings
							</p>
						</div>
					</div>

					<Button
						onClick={handleSaveProfile}
						className='bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white'
					>
						<Save className='h-4 w-4 mr-2' />
						Save Profile
					</Button>
				</div>

				{/* Security Settings */}
				<div className='glass-card space-y-6'>
					<div className='flex items-center gap-3'>
						<Key className='h-5 w-5 text-purple-400' />
						<h2 className='text-lg font-semibold text-white'>Security</h2>
					</div>

					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='current-password' className='text-gray-300'>
								Current Password
							</Label>
							<Input
								id='current-password'
								type='password'
								placeholder='••••••••'
								value={passwords.current}
								onChange={e =>
									setPasswords(prev => ({ ...prev, current: e.target.value }))
								}
								className='glow-border bg-white/5 border-white/10 text-white'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='new-password' className='text-gray-300'>
								New Password
							</Label>
							<Input
								id='new-password'
								type='password'
								placeholder='••••••••'
								value={passwords.new}
								onChange={e =>
									setPasswords(prev => ({ ...prev, new: e.target.value }))
								}
								className='glow-border bg-white/5 border-white/10 text-white'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='confirm-password' className='text-gray-300'>
								Confirm New Password
							</Label>
							<Input
								id='confirm-password'
								type='password'
								placeholder='••••••••'
								value={passwords.confirm}
								onChange={e =>
									setPasswords(prev => ({ ...prev, confirm: e.target.value }))
								}
								className='glow-border bg-white/5 border-white/10 text-white'
							/>
						</div>
					</div>

					<Button
						onClick={handleUpdatePassword}
						variant='outline'
						className='glow-border bg-transparent text-purple-400 hover:bg-purple-400/10'
					>
						Update Password
					</Button>
				</div>

				{/* API Tokens */}
				<div className='glass-card space-y-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<Key className='h-5 w-5 text-pink-400' />
							<h2 className='text-lg font-semibold text-white'>API Tokens</h2>
						</div>
						<Button
							variant='outline'
							className='glow-border bg-transparent text-pink-400 hover:bg-pink-400/10'
						>
							Generate New Token
						</Button>
					</div>

					<div className='space-y-3'>
						<div className='flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10'>
							<div>
								<div className='font-medium text-white'>
									Production API Token
								</div>
								<div className='text-sm text-gray-400'>
									Created 2 days ago • Last used 1 hour ago
								</div>
							</div>
							<Button
								variant='ghost'
								size='sm'
								className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
							>
								Revoke
							</Button>
						</div>

						<div className='flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10'>
							<div>
								<div className='font-medium text-white'>Development Token</div>
								<div className='text-sm text-gray-400'>
									Created 1 week ago • Last used 3 days ago
								</div>
							</div>
							<Button
								variant='ghost'
								size='sm'
								className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
							>
								Revoke
							</Button>
						</div>
					</div>
				</div>

				{/* Preferences */}
				<div className='glass-card space-y-6'>
					<div className='flex items-center gap-3'>
						<Palette className='h-5 w-5 text-green-400' />
						<h2 className='text-lg font-semibold text-white'>Preferences</h2>
					</div>

					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='font-medium text-white'>Dark Mode</div>
								<div className='text-sm text-gray-400'>
									Use dark theme across the application
								</div>
							</div>
							<Switch
								checked={darkMode}
								onCheckedChange={setDarkMode}
								className='data-[state=checked]:bg-cyan-500'
							/>
						</div>

						<Separator className='bg-white/10' />

						<div className='flex items-center justify-between'>
							<div>
								<div className='font-medium text-white'>
									Email Notifications
								</div>
								<div className='text-sm text-gray-400'>
									Receive updates about your infrastructure
								</div>
							</div>
							<Switch
								checked={notifications}
								onCheckedChange={setNotifications}
								className='data-[state=checked]:bg-cyan-500'
							/>
						</div>
					</div>
				</div>

				{/* Danger Zone */}
				<div className='glass-card space-y-6 border-red-500/20'>
					<div className='flex items-center gap-3'>
						<Trash2 className='h-5 w-5 text-red-400' />
						<h2 className='text-lg font-semibold text-white'>Danger Zone</h2>
					</div>

					<div className='p-4 rounded-lg bg-red-500/10 border border-red-500/20'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='font-medium text-white'>Delete Account</div>
								<div className='text-sm text-gray-400'>
									Permanently delete your account and all data
								</div>
							</div>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant='destructive'
										className='bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
									>
										Delete Account
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className='glass border-white/10'>
									<AlertDialogHeader>
										<AlertDialogTitle className='text-white'>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription className='text-gray-400'>
											This action cannot be undone. This will permanently delete
											your account and remove all your data from our servers.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className='bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction className='bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'>
											Delete Account
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	)
}
