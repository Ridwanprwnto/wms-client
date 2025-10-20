// src/routes/logout/+page.server.js
import { logoutService } from '$lib/services/authService.js';
import { redirect } from '@sveltejs/kit';
import { COOKIE_OPTIONS } from '$lib/config/cookies.js';
import { logger } from '$lib/utils/logger.js';

export async function load({ cookies, url }) {
	const token = cookies.get('token');
	const userCookie = cookies.get('user');
	let username = 'unknown';

	// Parse username untuk logging
	if (userCookie) {
		try {
			const user = JSON.parse(userCookie);
			username = user.username || 'unknown';
		} catch (e) {
			logger.error('Failed to parse user cookie in logout', e);
		}
	}

	logger.info('Logout initiated', { 
		hasToken: !!token, 
		username,
		pathname: url.pathname
	});

	// Call API logout endpoint if token exists
	if (token) {
		try {
			const result = await logoutService(token);

			if (!result.success) {
				logger.warn('Logout service failed, continuing with local logout', {
					message: result.message,
					username
				});
			} else {
				logger.info('Logout service successful', { username });
			}
		} catch (error) {
			logger.error('API logout error, continuing with local logout', error, {
				username
			});
			// Continue with local logout even if API call fails
		}
	}

	// Prepare cookie options for deletion
	// PENTING: Hapus maxAge dari COOKIE_OPTIONS saat delete
	const { maxAge, ...deleteCookieOptions } = COOKIE_OPTIONS;

	logger.info('Deleting cookies', { 
		username,
		deleteCookieOptions 
	});

	// Clear cookies dengan options yang sama seperti saat set (minus maxAge)
	cookies.delete('token', deleteCookieOptions);
	cookies.delete('user', deleteCookieOptions);

	// Verify cookies deleted (untuk debugging di production)
	const tokenAfter = cookies.get('token');
	const userAfter = cookies.get('user');
	
	if (tokenAfter || userAfter) {
		logger.error('Cookies NOT deleted properly!', {
			hasTokenAfter: !!tokenAfter,
			hasUserAfter: !!userAfter,
			username,
			cookieOptionsUsed: deleteCookieOptions,
			WARNING: 'Check COOKIE_SECURE setting matches your protocol (HTTP/HTTPS)'
		});
	} else {
		logger.info('Cookies deleted successfully', { username });
	}

	// Get redirect parameter
	const redirectTo = url.searchParams.get('redirect') || '/login';

	// Build redirect URL
	let redirectUrl;
	try {
		if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
			redirectUrl = new URL(redirectTo);
		} else {
			redirectUrl = new URL(redirectTo, url.origin);
		}
	} catch (e) {
		logger.error('Invalid redirect URL in logout', e, { redirectTo });
		redirectUrl = new URL('/login', url.origin);
	}

	// Add logout success parameter
	redirectUrl.searchParams.set('logout', 'success');

	logger.info('Logout complete, redirecting', {
		username,
		redirectTo: redirectUrl.pathname + redirectUrl.search
	});

	// Redirect - use pathname + search to avoid cross-origin issues
	throw redirect(302, redirectUrl.pathname + redirectUrl.search);
}