'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
	User,
	Mail,
	Calendar,
	Shield,
	Edit3,
	Save,
	X,
	Camera,
	Globe,
	MapPin,
	Phone,
	Building,
} from 'lucide-react'
import { useUser, useAuthLoading } from '@/lib/auth/store'
import { toast } from 'sonner'

export default function ProfilePage() {
	const user = useUser()
	const loading = useAuthLoading()
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		full_name: '',
		email: '',
		phone: '',
		bio: '',
		company: '',
		location: '',
		website: '',
	})

	// Initialize form data when user data loads
	useEffect(() => {
		if (user) {
			setFormData({
				full_name: user.user_metadata?.full_name || '',
				email: user.email || '',
				phone: user.user_metadata?.phone || '',
				bio: user.user_metadata?.bio || '',
				company: user.user_metadata?.company || '',
				location: user.user_metadata?.location || '',
				website: user.user_metadata?.website || '',
			})
		}
	}, [user])

	const handleSave = async () => {
		try {
			// Here you would typically update user metadata via Supabase
			// For now, we'll just show a success message
			toast.success('Profile updated successfully!')
			setIsEditing(false)
		} catch (error) {
			toast.error('Failed to update profile')
			console.error('Error updating profile:', error)
		}
	}

	const handleCancel = () => {
		// Reset form data to original values
		if (user) {
			setFormData({
				full_name: user.user_metadata?.full_name || '',
				email: user.email || '',
				phone: user.user_metadata?.phone || '',
				bio: user.user_metadata?.bio || '',
				company: user.user_metadata?.company || '',
				location: user.user_metadata?.location || '',
				website: user.user_metadata?.website || '',
			})
		}
		setIsEditing(false)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	}

	const getProviderIcon = (provider: string) => {
		switch (provider) {
			case 'google':
				return '🔍'
			case 'github':
				return '🐙'
			case 'discord':
				return '🎮'
			default:
				return '📧'
		}
	}

	if (loading) {
		return (
			<DashboardLayout>
				<div className='max-w-4xl mx-auto space-y-8'>
					<div className='flex items-center space-x-4'>
						<Skeleton className='h-20 w-20 rounded-full' />
						<div className='space-y-2'>
							<Skeleton className='h-8 w-48' />
							<Skeleton className='h-4 w-32' />
						</div>
					</div>
					<Skeleton className='h-96 w-full rounded-lg' />
				</div>
			</DashboardLayout>
		)
	}

	if (!user) {
		return (
			<DashboardLayout>
				<div className='max-w-4xl mx-auto'>
					<Card className='glass-card border-red-500/20'>
						<CardContent className='pt-6'>
							<div className='text-center text-red-400'>
								<Shield className='h-12 w-12 mx-auto mb-4' />
								<h2 className='text-xl font-semibold mb-2'>
									Authentication Required
								</h2>
								<p className='text-gray-400'>
									Please sign in to view your profile.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		)
	}

	return (
		<DashboardLayout>
			<div className='max-w-4xl mx-auto space-y-8'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-white'>My Profile</h1>
						<p className='text-gray-400 mt-1'>
							Manage your personal information and preferences
						</p>
					</div>
					<div className='flex gap-2'>
						{isEditing ? (
							<>
								<Button
									variant='outline'
									onClick={handleCancel}
									className='glass-btn border-white/20 text-gray-300 hover:bg-white/10'
								>
									<X className='h-4 w-4 mr-2' />
									Cancel
								</Button>
								<Button onClick={handleSave} className='gradient-border-btn'>
									<Save className='h-4 w-4 mr-2' />
									Save Changes
								</Button>
							</>
						) : (
							<Button
								onClick={() => setIsEditing(true)}
								className='gradient-border-btn'
							>
								<Edit3 className='h-4 w-4 mr-2' />
								Edit Profile
							</Button>
						)}
					</div>
				</div>

				{/* Profile Header */}
				<Card className='glass-card'>
					<CardContent className='pt-6'>
						<div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
							<div className='relative'>
								<Avatar className='h-24 w-24 border-2 border-accent-cyan/30'>
									<AvatarImage
										src={user.user_metadata?.avatar_url}
										alt={formData.full_name || user.email || 'User'}
									/>
									<AvatarFallback className='bg-accent-cyan/10 text-accent-cyan text-xl'>
										{(formData.full_name || user.email || 'U')
											.charAt(0)
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{isEditing && (
									<Button
										size='sm'
										className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-accent-cyan/20 hover:bg-accent-cyan/30'
									>
										<Camera className='h-4 w-4' />
									</Button>
								)}
							</div>

							<div className='flex-1 space-y-4'>
								<div className='flex flex-col md:flex-row md:items-center gap-4'>
									<div className='flex-1'>
										{isEditing ? (
											<Input
												value={formData.full_name}
												onChange={e =>
													setFormData(prev => ({
														...prev,
														full_name: e.target.value,
													}))
												}
												placeholder='Full Name'
												className='glass-input text-xl font-semibold'
											/>
										) : (
											<h2 className='text-2xl font-bold text-white'>
												{formData.full_name || 'Anonymous User'}
											</h2>
										)}
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
									</div>

									<div className='flex flex-wrap gap-2'>
										<Badge
											variant='outline'
											className='border-accent-cyan/30 text-accent-cyan'
										>
											{getProviderIcon(user.app_metadata?.provider || 'email')}
											{user.app_metadata?.provider || 'Email'}
										</Badge>
										<Badge
											variant='outline'
											className='border-purple-500/30 text-purple-400'
										>
											<User className='h-3 w-3 mr-1' />
											{user.role || 'User'}
										</Badge>
									</div>
								</div>

								{/* Bio */}
								<div className='space-y-2'>
									{isEditing ? (
										<div>
											<Label className='text-gray-300'>Bio</Label>
											<textarea
												value={formData.bio}
												onChange={e =>
													setFormData(prev => ({
														...prev,
														bio: e.target.value,
													}))
												}
												placeholder='Tell us about yourself...'
												className='w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none'
												rows={3}
											/>
										</div>
									) : (
										formData.bio && (
											<p className='text-gray-300 max-w-2xl'>{formData.bio}</p>
										)
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Account Information */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Personal Information */}
					<Card className='glass-card'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-white'>
								<User className='h-5 w-5 text-accent-cyan' />
								Personal Information
							</CardTitle>
							<CardDescription className='text-gray-400'>
								Your personal details and contact information
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 gap-4'>
								<div className='space-y-2'>
									<Label className='text-gray-300 flex items-center gap-2'>
										<Phone className='h-4 w-4' />
										Phone Number
									</Label>
									{isEditing ? (
										<Input
											value={formData.phone}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													phone: e.target.value,
												}))
											}
											placeholder='Phone number'
											className='glass-input'
										/>
									) : (
										<p className='text-white px-3 py-2'>
											{formData.phone || 'Not provided'}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label className='text-gray-300 flex items-center gap-2'>
										<Building className='h-4 w-4' />
										Company
									</Label>
									{isEditing ? (
										<Input
											value={formData.company}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													company: e.target.value,
												}))
											}
											placeholder='Company name'
											className='glass-input'
										/>
									) : (
										<p className='text-white px-3 py-2'>
											{formData.company || 'Not provided'}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label className='text-gray-300 flex items-center gap-2'>
										<MapPin className='h-4 w-4' />
										Location
									</Label>
									{isEditing ? (
										<Input
											value={formData.location}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													location: e.target.value,
												}))
											}
											placeholder='City, Country'
											className='glass-input'
										/>
									) : (
										<p className='text-white px-3 py-2'>
											{formData.location || 'Not provided'}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label className='text-gray-300 flex items-center gap-2'>
										<Globe className='h-4 w-4' />
										Website
									</Label>
									{isEditing ? (
										<Input
											value={formData.website}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													website: e.target.value,
												}))
											}
											placeholder='https://yourwebsite.com'
											className='glass-input'
										/>
									) : (
										<p className='text-white px-3 py-2'>
											{formData.website ? (
												<a
													href={formData.website}
													target='_blank'
													rel='noopener noreferrer'
													className='text-accent-cyan hover:text-cyan-300 underline'
												>
													{formData.website}
												</a>
											) : (
												'Not provided'
											)}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Account Details */}
					<Card className='glass-card'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-white'>
								<Shield className='h-5 w-5 text-purple-400' />
								Account Details
							</CardTitle>
							<CardDescription className='text-gray-400'>
								Information about your account and security
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-4'>
								<div>
									<Label className='text-gray-300 flex items-center gap-2'>
										<Calendar className='h-4 w-4' />
										Member Since
									</Label>
									<p className='text-white mt-1'>
										{user.created_at ? formatDate(user.created_at) : 'Unknown'}
									</p>
								</div>

								<Separator className='bg-white/10' />

								<div>
									<Label className='text-gray-300'>Last Sign In</Label>
									<p className='text-white mt-1'>
										{user.last_sign_in_at
											? formatDate(user.last_sign_in_at)
											: 'Unknown'}
									</p>
								</div>

								<Separator className='bg-white/10' />

								<div>
									<Label className='text-gray-300'>Account ID</Label>
									<p className='text-gray-400 text-sm mt-1 font-mono break-all'>
										{user.id}
									</p>
								</div>

								<Separator className='bg-white/10' />

								<div>
									<Label className='text-gray-300'>Email Status</Label>
									<div className='flex items-center gap-2 mt-1'>
										{user.email_confirmed_at ? (
											<Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
												✓ Verified
											</Badge>
										) : (
											<Badge
												variant='destructive'
												className='bg-red-500/20 text-red-400 border-red-500/30'
											>
												✗ Unverified
											</Badge>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	)
}
