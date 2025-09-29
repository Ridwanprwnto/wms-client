// src/lib/services/authService.js
import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';

/**
 * Memanggil API login authentication.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, token?: string, message?: string, user?: object }>}
 */
export async function loginService(username, password) {
	try {
		const startTime = Date.now();
		// Gunakan service IMS untuk authentication
		const loginUrl = buildApiUrl('IMS', '/auth/users/login');

		logger.info(`Login URL: ${loginUrl}`);

		const res = await fetch(loginUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			logger.error('Failed to parse response as JSON:', {
				text
			});
			data = null;
		}

		if (!res.ok) {
			logger.error(`Login failed with status ${res?.status}`);
			return {
				success: false,
				message: data?.message || `Login gagal (${res?.status})`
			};
		}

		if (data?.success === false) {
			return { success: false, message: data.message || 'Login gagal' };
		}

		logger.info('Login successful');
		return { success: true, token: data?.token, user: data?.user };
	} catch (err) {
		logger.error('Login service error:', {
			err
		});
		return { success: false, message: err.message };
	}
}

/**
 * Memverifikasi validitas token dengan memanggil API verify.
 * @param {string} token
 * @returns {Promise<{ success: boolean, user?: object, message?: string }>}
 */
export async function verifyTokenService(token) {
	try {
		// Gunakan service IMS untuk token verification
		const verifyUrl = buildApiUrl('IMS', '/main/token/refresh');

		logger.info(`Verify URL: ${verifyUrl}`);

		const res = await fetch(verifyUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			console.error('Failed to parse verify response as JSON:', text);
			data = null;
		}

		if (!res.ok) {
			logger.error(`Token verification failed with status ${res.status}:`, data);
			return {
				success: false,
				message: data?.message || `Token verification failed (${res.status})`
			};
		}

		if (data?.success === false) {
			return { success: false, message: data.message || 'Token tidak valid' };
		}

		logger.info('Verify token valid', { token: data?.token || 'no_token_returned' });
		return { success: true, token: data?.token, user: data?.user };
	} catch (err) {
		logger.error('Token verification error', err);
		return { success: false, message: err.message };
	}
}

/**
 * Melakukan logout dengan memanggil API logout.
 * @param {string} token
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function logoutService(token) {
	try {
		// Gunakan service IMS untuk logout
		const logoutUrl = buildApiUrl('IMS', '/auth/users/logout');

		logger.info(`Logout URL: ${logoutUrl}`);

		const res = await fetch(logoutUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			logger.error('Failed to parse logout response as JSON:', text);
			data = null;
		}

		if (!res.ok) {
			logger.error(`Logout failed with status ${res.status}:`, data);
			return {
				success: false,
				message: data?.message || `Logout failed (${res.status})`
			};
		}

		logger.info('Logout successful');
		return { success: true, message: data?.message || 'Logout berhasil' };
	} catch (err) {
		logger.error('Logout service error:', err);
		return { success: false, message: err.message };
	}
}
