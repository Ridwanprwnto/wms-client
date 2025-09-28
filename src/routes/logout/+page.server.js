// src/routes/logout/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
	// Get the token to potentially call API logout endpoint
	const token = cookies.get('token');

	// Optional: Call API logout endpoint to invalidate token on server
	if (token) {
		try {
			// If your API has a logout endpoint, call it here
			// await fetch(`${API_BASE_URL}/auth/logout`, {
			// 	method: 'POST',
			// 	headers: {
			// 		'Authorization': `Bearer ${token}`,
			// 		'Content-Type': 'application/json'
			// 	}
			// });
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
