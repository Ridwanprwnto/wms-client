// src/lib/config/cookies.js
import { dev } from '$app/environment';
import { NODE_ENV, COOKIE_SECURE, ORIGIN } from '$env/static/private';

/**
 * Deteksi HTTPS dari berbagai sumber environment variable
 */
function detectHttps() {
	// 1. Explicit COOKIE_SECURE (tertinggi priority)
	const cookieSecure = COOKIE_SECURE;
	if (cookieSecure !== undefined && cookieSecure !== '') {
		return cookieSecure === 'true';
	}

	// 2. ORIGIN URL check (paling umum di deployment platforms)
	const origin = ORIGIN;
	if (origin && typeof origin === 'string') {
		return origin.toLowerCase().startsWith('https://');
	}

	// Default: false untuk development, true hanya jika NODE_ENV=production
	// dan tidak ada env var yang menentukan sebaliknya
	return !dev && NODE_ENV === 'production';
}

const isHttps = detectHttps();

export const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: isHttps,
	maxAge: 60 * 60 * 24 // 24 jam
};


// Export config untuk debugging
export const cookieConfig = {
	dev,
	NODE_ENV: NODE_ENV,
	ORIGIN: ORIGIN,
	COOKIE_SECURE: COOKIE_SECURE,
	secure: isHttps
};

// Log configuration saat startup (hanya di server)
if (typeof window === 'undefined') {
	console.log('Cookie Configuration:', cookieConfig);
}