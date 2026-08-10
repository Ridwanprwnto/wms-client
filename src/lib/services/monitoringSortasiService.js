import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_WMS } from '$env/static/private';

/**
 * Generic fetch wrapper for Monitoring Sortasi.
 * @param {string} endpoint
 * @param {RequestInit} [options]
 */
async function apiFetch(endpoint, options = {}) {
	const url = buildApiUrl('WMS', `/main/sortasi${endpoint}`);

	let res;
	try {
		res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				apikey: API_KEY_WMS,
				...options.headers
			},
			...options
		});
	} catch (networkErr) {
		const msg = `[monitoringSortasiService] Network error saat menghubungi ${url}: ${networkErr?.message ?? networkErr}`;
		logger.error(msg);
		throw new Error('Gagal menghubungi server WMS.');
	}

	if (!res.ok) {
		let errMsg = `API error ${res.status} pada ${url}`;
		try {
			const body = await res.json();
			errMsg = body.error || body.message || errMsg;
		} catch { /* body bukan JSON */ }
		logger.error(`[monitoringSortasiService] ${errMsg}`);
		throw new Error(errMsg);
	}

	const text = await res.text();
	if (!text || text.trim() === '') return null;

	try {
		return JSON.parse(text);
	} catch {
		logger.error(`[monitoringSortasiService] Response bukan JSON valid dari ${url}: ${text.slice(0, 200)}`);
		throw new Error('Response dari server bukan format JSON yang valid.');
	}
}

/**
 * Fetch monitoring sortasi progress data.
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function getMonitoringSortasi(date) {
	try {
		const query = date ? `?date=${encodeURIComponent(date)}` : '';
		const response = await apiFetch(`/monitoring${query}`, {
			method: 'GET'
		});
		return response;
	} catch (error) {
		logger.error(`[monitoringSortasiService.getMonitoringSortasi] Error: ${error.message}`);
		throw error;
	}
}

/**
 * Fetch container details for a specific sorting process (nopick).
 * @param {string} nopick - No Pick identifier
 */
export async function getMonitoringSortasiDetails(nopick) {
	try {
		const response = await apiFetch(`/monitoring/${encodeURIComponent(nopick)}/details`, {
			method: 'GET'
		});
		return response;
	} catch (error) {
		logger.error(`[monitoringSortasiService.getMonitoringSortasiDetails] Error: ${error.message}`);
		throw error;
	}
}
