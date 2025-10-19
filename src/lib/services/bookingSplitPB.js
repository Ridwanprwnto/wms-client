// src/lib/services/planogram.service.js
import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_DPD } from '$env/static/private';

/**
 * Mengambil data berdasarkan date, nopick dan pluid
 * @param {string} date - date
 * @param {string} nopick - nopick
 * @param {string} pluid - pluid
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function getBookingPBService(date, nopick, pluid) {
	try {
		const url = buildApiUrl('DPD', '/main/planopick/datapick');
		logger.info(`Get Booking Split PB URL: ${url}`);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				apikey: API_KEY_DPD
			},
			body: JSON.stringify({ date, nopick, pluid })
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
			logger.error(`Get booking split PB with status ${res.status}`);
			return {
				success: false,
				message: data?.message || `Failed to fetch data (${res.status})`
			};
		}

		logger.info('Get booking split PB successful', { data });
		return { success: true, data };
	} catch (err) {
		logger.error('Get booking split PB service error:', { err });
		return { success: false, message: err.message };
	}
}

/**
 * Submit data
 * @param {Object} payload - Data payload
 * @param {string} payload.pluid - pluid
 * @param {string} payload.line - line
 * @param {string} payload.ip - ip
 * @param {string} payload.id - id
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function submitUpdateBookingPBService(payload, seqNoSplit) {
	try {
		const url = buildApiUrl('DPD', `/main/planopick/datapick/${seqNoSplit}`);
		logger.info(`Submit update data split booking picking URL: ${url}`);

		// Transform to API format
		const transformedData = {
			pluid: payload.pluId,
			line: payload.line,
			ip: payload.ip,
			id: payload.id
		};

		const res = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				apikey: API_KEY_DPD
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
			logger.error(`Submit update booking split picking failed with status ${res.status}`);
			return {
				success: false,
				message: data?.message || `Submit failed (${res.status})`
			};
		}

		if (data?.success === false) {
			return { success: false, message: data.message || 'Submit gagal' };
		}

		logger.info('Submit update booking split picking successful');
		return { success: true, data, message: data?.message || 'Data berhasil diposting' };
	} catch (err) {
		logger.error('Submit update booking split picking service error:', { err });
		return { success: false, message: err.message };
	}
}
