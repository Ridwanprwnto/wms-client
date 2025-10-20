// src/lib/config/cookies.js
import { dev } from '$app/environment';

/**
 * Deteksi HTTPS dari berbagai sumber environment variable
 */
function detectHttps() {
	// 1. Check explicit COOKIE_SECURE env var (highest priority)
	if (process.env.COOKIE_SECURE !== undefined) {
		return process.env.COOKIE_SECURE === 'true';
	}

	// 2. Check USE_HTTPS env var
	if (process.env.USE_HTTPS !== undefined) {
		return process.env.USE_HTTPS === 'true';
	}

	// 3. Check PROTOCOL env var
	if (process.env.PROTOCOL !== undefined) {
		return process.env.PROTOCOL === 'https';
	}

	// 4. Check ORIGIN env var (contains protocol)
	if (process.env.ORIGIN && typeof process.env.ORIGIN === 'string') {
		return process.env.ORIGIN.startsWith('https://');
	}

	// 5. Default: false untuk development, false untuk production tanpa config
	// Safer to default to false untuk menghindari cookies tidak berfungsi
	return false;
}

const isHttps = detectHttps();

export const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'strict',
	secure: isHttps,
	maxAge: 60 * 60 * 24 // 24 jam
};

// Export config untuk debugging
export const cookieConfig = {
	dev,
	NODE_ENV: process.env.NODE_ENV,
	ORIGIN: process.env.ORIGIN,
	COOKIE_SECURE: process.env.COOKIE_SECURE,
	PROTOCOL: process.env.PROTOCOL,
	secure: isHttps
};

// Log configuration saat startup (hanya di server)
if (typeof window === 'undefined') {
	console.log('Cookie Configuration:', cookieConfig);
}