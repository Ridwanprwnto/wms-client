// src/lib/services/planogram.service.js
import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY } from '$env/static/private';

/**
 * Mengambil data tabel lokasi planogram berdasarkan office dan PLU ID
 * @param {string} office - Office ID
 * @param {string} pluid - PLU ID
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function getTableLokPlanoService(office, pluid) {
	try {
		const url = buildApiUrl('WHS', '/main/planogroup/tablokplano');
		logger.info(`Get Table Lok Plano URL: ${url}`);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'apikey': API_KEY
			},
			body: JSON.stringify({ office, pluid })
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			logger.error('Failed to parse response as JSON:', { text });
			data = null;
		}

		if (!res.ok) {
			logger.error(`Get Table Lok Plano failed with status ${res.status}`);
			return {
				success: false,
				message: data?.message || `Failed to fetch data (${res.status})`
			};
		}

		logger.info('Get Table Lok Plano successful', {data});
		return { success: true, data };
	} catch (err) {
		logger.error('Get Table Lok Plano service error:', { err });
		return { success: false, message: err.message };
	}
}

/**
 * Mengambil data zona rak berdasarkan tipe rak
 * @param {string} tiperak - Tipe Rak
 * @returns {Promise<{ success: boolean, data?: Array, message?: string }>}
 */
export async function getZonaRakService(tiperak) {
	try {
		const url = buildApiUrl('WHS', '/main/planogroup/zonarak');
		logger.info(`Get Zona Rak URL: ${url}`);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'apikey': API_KEY
			},
			body: JSON.stringify({ tiperak })
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			logger.error('Failed to parse response as JSON:', { text });
			data = null;
		}

		if (!res.ok) {
			logger.error(`Get Zona Rak failed with status ${res.status}`);
			return {
				success: false,
				message: data?.message || `Failed to fetch zona rak (${res.status})`
			};
		}

		logger.info('Get Zona Rak successful');
		return { success: true, data: Array.isArray(data) ? data : [] };
	} catch (err) {
		logger.error('Get Zona Rak service error:', { err });
		return { success: false, message: err.message };
	}
}

/**
 * Mengambil data line rak berdasarkan tipe rak dan line rak
 * @param {string} tiperak - Tipe Rak
 * @param {string} linerak - Line Rak
 * @returns {Promise<{ success: boolean, data?: Array, message?: string }>}
 */
export async function getLineRakService(tiperak, linerak) {
	try {
		const url = buildApiUrl('WHS', '/main/planogroup/linerak');
		logger.info(`Get Line Rak URL: ${url}`);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'apikey': API_KEY
			},
			body: JSON.stringify({ tiperak, linerak })
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			logger.error('Failed to parse response as JSON:', { text });
			data = null;
		}

		if (!res.ok) {
			logger.error(`Get Line Rak failed with status ${res.status}`);
			return {
				success: false,
				message: data?.message || `Failed to fetch line rak (${res.status})`
			};
		}

		logger.info('Get Line Rak successful');
		return { success: true, data: Array.isArray(data) ? data : [] };
	} catch (err) {
		logger.error('Get Line Rak service error:', { err });
		return { success: false, message: err.message };
	}
}

/**
 * Submit data nearest group planogram
 * @param {Object} payload - Data payload
 * @param {string} payload.pageId - Page ID
 * @param {string} payload.ipId - IP Address
 * @param {string} payload.userId - User ID
 * @param {string} payload.officeId - Office ID
 * @param {string} payload.pluId - PLU ID
 * @param {Array<{line: string, rak: string[]}>} payload.nearestGroups - Nearest Groups
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function submitNearestGroupService(payload) {
	try {
		const url = buildApiUrl('WHS', '/main/planogroup/grouprak');
		logger.info(`Submit Nearest Group URL: ${url}`);

		  // Transform to API format
		  const transformedData = {
			PLU: payload.pluId,
			IP: payload.ipId,
			OFFICEID: payload.officeId,
			TYPEPLA: payload.tipePlano,
			LINEPLA: payload.lineNearestGroup,
			RAK_PLA: payload.rakNearestGroup
		};

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'apikey': API_KEY
			},
			body: JSON.stringify(transformedData)
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			logger.error('Failed to parse response as JSON:', { text });
			data = null;
		}

		if (!res.ok) {
			logger.error(`Submit Nearest Group failed with status ${res.status}`);
			return {
				success: false,
				message: data?.message || `Submit failed (${res.status})`
			};
		}

		if (data?.success === false) {
			return { success: false, message: data.message || 'Submit gagal' };
		}

		logger.info('Submit Nearest Group successful');
		return { success: true, data, message: data?.message || 'Data berhasil diposting' };
	} catch (err) {
		logger.error('Submit Nearest Group service error:', { err });
		return { success: false, message: err.message };
	}
}