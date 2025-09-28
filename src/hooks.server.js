import { redirect } from '@sveltejs/kit';
import { verifyTokenService } from '$lib/services/authService.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get('token');
	const { pathname } = event.url;

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
		return resolve(event);
	}

	// Jika mengakses login tapi sudah ada token, cek validitas token
	if (pathname === '/login' && token) {
		try {
			const verification = await verifyTokenService(token);
			if (verification.success) {
				console.log('Valid token found, redirecting to dashboard');
				throw redirect(307, '/dashboard');
			} else {
				// Token tidak valid, hapus dan lanjutkan ke login
				console.log('Invalid token found, clearing cookies');
				event.cookies.delete('token', { path: '/' });
				event.cookies.delete('user', { path: '/' });
			}
		} catch (error) {
			console.error('Token verification error:', error);
			// Jika ada error saat verifikasi, hapus token dan lanjutkan
			event.cookies.delete('token', { path: '/' });
			event.cookies.delete('user', { path: '/' });
		}
	}

	// Jika mengakses protected route, cek token
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		if (!token) {
			console.log('No token found, redirecting to login');
			const redirectUrl = new URL('/login', event.url.origin);
			throw redirect(307, redirectUrl.toString());
		}

		// Optional: Verify token validity untuk protected routes
		try {
			const verification = await verifyTokenService(token);
			if (!verification.success) {
				console.log('Token verification failed, redirecting to login');
				// Token tidak valid, hapus dan redirect ke login
				event.cookies.delete('token', { path: '/' });
				event.cookies.delete('user', { path: '/' });

				const redirectUrl = new URL('/login', event.url.origin);
				throw redirect(307, redirectUrl.toString());
			}

			// Token valid, simpan user info ke locals
			event.locals.user = verification.user;
			event.locals.token = token;
		} catch (error) {
			console.error('Token verification error in protected route:', error);
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
				console.error('Error parsing user cookie:', error);
				event.cookies.delete('user', { path: '/' });
			}
		}
	}

	return resolve(event);
}
