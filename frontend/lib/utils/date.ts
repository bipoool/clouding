/**
 * Date utility functions for formatting dates consistently across the application
 */

/**
 * Formats a date string to a human-readable format
 * @param dateString - The date string to format
 * @returns Formatted date string in "Month Day, Year" format
 */
export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
} 