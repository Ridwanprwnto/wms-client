// src/routes/(auth)/login/+page.server.js
import { loginService } from '$lib/services/authService.js';
import { redirect, fail } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { logger } from '$lib/utils/logger.js';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString().trim();
		const password = data.get('password')?.toString();

		try {
			// Validasi input
			if (!username || !password) {
				return fail(400, {
					error: 'Username dan password harus diisi',
					username: username || ''
				});
			}

			logger.info(`Attempting login for username: ${username}`);

			const result = await loginService(username, password);

			if (!result.success) {
				// Customize error message based on common API responses
				let errorMessage = result.message || 'Login gagal, coba lagi';

				logger.error(`Login failed ${errorMessage}`);

				return fail(400, {
					error: errorMessage,
					username: username
				});
			}

			// Validasi response dari API
			if (!result.token) {
				logger.error('Login success but no token received');
				return fail(500, {
					error: 'Login berhasil tetapi token tidak diterima',
					username: username
				});
			}

			logger.info(`Login successful for: ${username}`);

			// Cookie options
			const cookieOptions = {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: !dev, // secure di production, tidak secure di development
				maxAge: 60 * 60 * 24 // 24 jam
			};

			// Simpan token ke cookie
			cookies.set('token', result.token, cookieOptions);

			// Simpan user info
			let userInfo;
			if (result.user && typeof result.user === 'object') {
				// Gunakan user info dari API dengan fallback values
				userInfo = {
					username: result.user.username || username,
					id: result.user.id || null,
					email: result.user.email || null,
					role: result.user.groupName || null,
					officecode: result.user.officeCode || null,
					officename: result.user.officeName || null,
					deptcode: result.user.deptCode || null,
					deptname: result.user.deptName || null,
					divcode: result.user.divCode || null,
					divname: result.user.divName || null,
					...result.user, // spread user data dari API
					loginTime: new Date().toISOString()
				};
			} else {
				// Fallback user info
				userInfo = {
					username: username,
					id: result.user.id || null,
					email: result.user?.email || null,
					role: result.user?.role || 'user',
					loginTime: new Date().toISOString()
				};
			}

			try {
				cookies.set('user', JSON.stringify(userInfo), cookieOptions);
				logger.info('User info saved to cookie:', {
					username: userInfo.username,
					role: userInfo.role
				});
			} catch (cookieError) {
				logger.error('Failed to save user info to cookie:', { cookieError });
				// Tetap lanjut login meski gagal simpan user info
			}

			throw redirect(302, '/dashboard');
		} catch (error) {
			// Jika error adalah redirect, lempar ulang tanpa log error
			if (error.status === 302 || error.status === 307) {
				throw error;
			}

			logger.error(`Login action error: ${error}`);

			// Handle different types of errors
			let errorMessage = 'Terjadi kesalahan server, coba lagi nanti';

			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				errorMessage = 'Tidak dapat terhubung ke server, periksa koneksi internet Anda';
			} else if (error.message.includes('timeout')) {
				errorMessage = 'Request timeout, server tidak merespons';
			} else if (error.message.includes('ECONNREFUSED')) {
				errorMessage = 'Server sedang tidak tersedia, coba lagi nanti';
			} else if (error.message.includes('network')) {
				errorMessage = 'Masalah jaringan, periksa koneksi internet Anda';
			}

			return fail(500, {
				error: errorMessage,
				username: username || ''
			});
		}
	}
};
