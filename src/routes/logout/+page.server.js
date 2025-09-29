// src/routes/logout/+page.server.js
import { logoutService } from '$lib/services/authService.js';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
	// Get the token to potentially call API logout endpoint
	const token = cookies.get('token');

	// Optional: Call API logout endpoint to invalidate token on server
	if (token) {
		try {
			const result = await logoutService(token);

			if (!result.success) {
				let errorMessage = result.message || 'Gagal logout ke server';

				console.log('Logout failed:', errorMessage);

				return fail(400, {
					error: errorMessage,
					username: username
				});
			}
		} catch (error) {
			console.error('API logout error:', error);
			// Continue with local logout even if API call fails
		}
	}

	// Clear all authentication-related cookies
	cookies.delete('token', { path: '/' });
	cookies.delete('user', { path: '/' });

	// Get redirect parameter for custom redirect after logout
	const redirectTo = url.searchParams.get('redirect') || '/login';

	// Add logout success message as URL parameter
	const redirectUrl = new URL(redirectTo, url.origin);

	// Redirect to login page with success message
	throw redirect(302, redirectUrl.toString());
}
