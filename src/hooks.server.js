import { redirect } from '@sveltejs/kit';
import { verifyTokenService } from '$lib/services/authService.js';
import { logger } from '$lib/utils/logger.js';
import { API_RESPONSE_TIME } from '$env/static/private';

/**
 * Safely get client IP address
 */
function getClientIP(event) {
	try {
		return event.getClientAddress();
	} catch (error) {
		// Fallback untuk development mode atau jika getClientAddress tidak tersedia
		const forwarded = event.request.headers.get('x-forwarded-for');
		const realIP = event.request.headers.get('x-real-ip');
		const remoteAddr = event.request.headers.get('remote-addr');

		return forwarded?.split(',')[0] || realIP || remoteAddr || 'localhost';
	}
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const startTime = Date.now();
	const token = event.cookies.get('token');
	const { pathname } = event.url;
	const userAgent = event.request.headers.get('user-agent') || 'unknown';
	const clientIP = event.getClientAddress();

	// Log incoming request
	logger.http(`${event.request.method} ${pathname}`, {
		method: event.request.method,
		pathname,
		userAgent: userAgent.substring(0, 100), // Limit length
		clientIP,
		hasToken: !!token
	});

	// Public routes yang bisa diakses tanpa login
	const publicRoutes = ['/', '/login', '/logout'];

	// Protected routes yang butuh login
	const protectedRoutes = [
		'/dashboard',
		'/users',
		'/products',
		'/analytics',
		'/inventory',
		'/orders',
		'/settings',
		'/profile'
	];

	// Jika mengakses logout route, biarkan lewat (akan dihandle oleh +page.server.js)
	if (pathname === '/logout') {
		logger.info('Logout route accessed', { pathname, hasToken: !!token });
		return resolve(event);
	}

	// Jika mengakses login tapi sudah ada token, cek validitas token
	if (pathname === '/login' && token) {
		logger.info('Login page accessed with existing token', { pathname });
		try {
			const verification = await verifyTokenService(token);
			if (verification.success) {
				logger.info('Valid token found, redirecting to dashboard', {
					username: verification.user?.username,
					redirectFrom: pathname
				});
				throw redirect(307, '/dashboard');
			} else {
				// Token tidak valid, hapus dan lanjutkan ke login
				logger.warn('Invalid token found on login page, clearing cookies', {
					reason: verification.message
				});
				logger.logSecurity('invalid_token_cleared', 'low', {
					pathname,
					reason: verification.message
				});
				event.cookies.delete('token', { path: '/' });
				event.cookies.delete('user', { path: '/' });
			}
		} catch (error) {
			// Jika error adalah redirect, lempar ulang
			if (error.status === 307) {
				throw error;
			}
			logger.error('Token verification error on login page', error, { pathname });
			// Jika ada error saat verifikasi, hapus token dan lanjutkan
			event.cookies.delete('token', { path: '/' });
			event.cookies.delete('user', { path: '/' });
		}
	}

	// Jika mengakses protected route, cek token
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		if (!token) {
			logger.warn('Protected route accessed without token', {
				pathname,
				clientIP,
				userAgent: userAgent.substring(0, 100)
			});

			logger.logSecurity('unauthorized_access_attempt', 'medium', {
				pathname,
				clientIP,
				reason: 'no_token'
			});

			const redirectUrl = new URL('/login', event.url.origin);
			throw redirect(307, redirectUrl.toString());
		}

		// Optional: Verify token validity untuk protected routes
		try {
			const verification = await verifyTokenService(token);
			if (!verification.success) {
				logger.warn('Token verification failed on protected route', {
					pathname,
					reason: verification.message,
					clientIP
				});

				logger.logSecurity('invalid_token_on_protected_route', 'medium', {
					pathname,
					reason: verification.message,
					clientIP
				});

				// Token tidak valid, hapus dan redirect ke login
				event.cookies.delete('token', { path: '/' });
				event.cookies.delete('user', { path: '/' });

				const redirectUrl = new URL('/login', event.url.origin);
				throw redirect(307, redirectUrl.toString());
			}

			// Token valid, simpan user info ke locals
			event.locals.user = verification.user;
			event.locals.token = token;

			logger.info('Protected route access granted', {
				pathname,
				username: verification.user?.username,
				role: verification.user?.groupName
			});
		} catch (error) {
			// Jika error adalah redirect, lempar ulang
			if (error.status === 307) {
				throw error;
			}

			logger.error('Token verification error in protected route', error, {
				pathname,
				clientIP,
				hasToken: !!token
			});

			logger.logSecurity('token_verification_error', 'high', {
				pathname,
				error: error.message,
				clientIP
			});
			// Jika ada network error, biarkan request lanjut dengan token yang ada
			// Tapi log error untuk monitoring
		}
	}

	// Tambahkan token ke locals jika ada (untuk akses di load functions)
	if (token) {
		event.locals.token = token;

		// Jika ada user info di cookie, tambahkan juga
		const userCookie = event.cookies.get('user');
		if (userCookie) {
			try {
				event.locals.user = JSON.parse(userCookie);
			} catch (error) {
				logger.error('Error parsing user cookie', error, {
					pathname,
					cookieLength: userCookie.length
				});
				event.cookies.delete('user', { path: '/' });
			}
		}
	}

	try {
		const response = await resolve(event);
		const responseTime = Date.now() - startTime;

		// Log response
		logger.logPerformance(`${event.request.method} ${pathname}`, responseTime, {
			statusCode: response.status,
			clientIP
		});

		// Log slow requests
		if (responseTime > API_RESPONSE_TIME) {
			logger.warn('Slow request detected', {
				method: event.request.method,
				pathname,
				responseTime,
				statusCode: response.status
			});
		}

		return response;
	} catch (error) {
		const responseTime = Date.now() - startTime;

		// Jika error adalah redirect, log dan lempar ulang
		if (error.status === 307 || error.status === 302) {
			logger.info('Redirect response', {
				from: pathname,
				to: error.location,
				statusCode: error.status,
				responseTime
			});
			throw error;
		}

		logger.error('Handle error', error, {
			method: event.request.method,
			pathname,
			responseTime,
			clientIP
		});

		throw error;
	}
}
