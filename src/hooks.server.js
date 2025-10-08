import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
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
		'/planogram/grup-pertemanan',
		'/planogram/booking-picking',
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
				// Token tidak valid, hapus dan redirect ke login
				event.cookies.delete('token', { path: '/' });
				event.cookies.delete('user', { path: '/' });

				const redirectUrl = new URL('/login', event.url.origin);
				throw redirect(307, redirectUrl.toString());
			}

			let activeToken = token;
			let userInfo;

			// kalau backend kasih token baru (refresh)
			if (verification.token && verification.token !== token) {
				activeToken = verification.token;

				// Cookie options
				const cookieOptions = {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: !dev, // secure di production, tidak secure di development
					maxAge: 60 * 60 * 24 // 24 jam
				};
	
				// Simpan token ke cookie
				cookies.set('token', activeToken, cookieOptions);
		

				// Simpan user info
				if (verification.user && typeof verification.user === 'object') {
					// Gunakan user info dari API dengan fallback values
					userInfo = {
						username: verification.user.username || username,
						id: verification.user.id || null,
						email: verification.user.email || null,
						role: verification.user.groupName || null,
						officecode: verification.user.officeCode || null,
						officename: verification.user.officeName || null,
						deptcode: verification.user.deptCode || null,
						deptname: verification.user.deptName || null,
						divcode: verification.user.divCode || null,
						divname: verification.user.divName || null,
						...verification.user, // spread user data dari API
						loginTime: new Date().toISOString()
					};
				}
		
				logger.info('Token refreshed successfully', {
					username: verification.user?.username
				});

				try {
					event.cookies.set('user', JSON.stringify(userInfo), cookieOptions);
					logger.info('User info saved to cookie:', {
						username: userInfo.username,
						role: userInfo.role
					});
				} catch (cookieError) {
					logger.error('Failed to save user info to cookie:', { cookieError });
					// Tetap lanjut login meski gagal simpan user info
				}
			}

			// simpan ke locals
			event.locals.token = activeToken;
			event.locals.user = userInfo;

			logger.info('Protected route access granted', {
				pathname,
				username: userInfo.username,
				role: userInfo.groupName
			});
			
		} catch (error) {
			if (error.status === 307) throw error;
			logger.error( error?.error || 'Token verification error');
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
