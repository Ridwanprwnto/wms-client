// src/routes/(auth)/login/+page.server.js
import { loginService } from '$lib/services/authService.js';
import { redirect, fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		try {
			const data = await request.formData();
			const username = data.get('username');
			const password = data.get('password');

			// Validasi input
			if (!username || !password) {
				return fail(400, {
					error: 'Username dan password harus diisi',
					username: username
				});
			}

			console.log('Attempting login for username:', username);

			const result = await loginService(username, password);

			if (!result.success) {
				// Customize error message based on common API responses
				let errorMessage = result.message || 'Login gagal, coba lagi';

				return fail(400, {
					error: errorMessage,
					username: username
				});
			}

			console.log('Response user check:', result);

			// Simpan token ke cookie (HttpOnly untuk keamanan)
			cookies.set('token', result.token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 // 24 jam
			});

			// Simpan user info jika ada (untuk display di UI)
			if (result.user) {
				// Simpan sebagai JSON string
				cookies.set('user', JSON.stringify(result.user), {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					maxAge: 60 * 60 * 24
				});

				console.log('User info saved:', result.user);
			} else {
				// Jika API tidak mengembalikan user info, buat basic user object
				const basicUser = {
					username: username,
					name: username, // Fallback name
					loginTime: new Date().toISOString()
				};

				cookies.set('user', JSON.stringify(basicUser), {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: false,
					maxAge: 60 * 60 * 24
				});

				console.log('Basic user info created:', basicUser);
			}

			console.log('Login successful, redirecting to dashboard');

			// Redirect ke dashboard kalau sukses
			throw redirect(302, '/dashboard');
		} catch (error) {
			console.error('Login action error:', error);

			// Jika error adalah redirect, lempar ulang
			if (error.status === 302) {
				throw error;
			}

			// Handle different types of errors
			let errorMessage = 'Terjadi kesalahan server, coba lagi nanti';

			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				errorMessage = 'Tidak dapat terhubung ke server, periksa koneksi internet Anda';
			} else if (error.message.includes('timeout')) {
				errorMessage = 'Request timeout, server tidak merespons';
			}

			return fail(500, {
				error: errorMessage,
				username: data?.get('username') || ''
			});
		}
	}
};
