// src/lib/services/ttdRetokService.js
// Service untuk pengecekan data TTD (tanda terima dokumen) retur toko.

import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_WHS } from '$env/static/private';

// =============================================================================
// HELPER: FETCH
// =============================================================================
async function apiFetch(subPath, options = {}) {
	const url = buildApiUrl('WHS', `/main/returtoko/${subPath}`);

	logger.info(`[ttdRetokService] ${options.method || 'GET'} ${url}`);

	let res;
	try {
		res = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				apikey: API_KEY_WHS,
				...(options.headers || {})
			}
		});
	} catch (err) {
		const msg = err?.message ?? String(err);
		logger.error(`[ttdRetokService] Network error: ${msg}`);
		throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
	}

	const text = await res.text();
	let body = null;

	if (text && text.trim() !== '') {
		try {
			body = JSON.parse(text);
		} catch {
			logger.error(`[ttdRetokService] Response bukan JSON valid: ${text.slice(0, 200)}`);
			body = null;
		}
	}

	if (!res.ok) {
		const errMsg = body?.error || body?.message || `API error ${res.status} pada ${url}`;
		logger.error(`[ttdRetokService] ${errMsg}`);
		throw new Error(errMsg);
	}

	return body;
}

// =============================================================================
// HELPER: NORMALIZER
// Memetakan field DB (snake_case) → field UI (camelCase)
// =============================================================================
function normalizeTTDRetok(row) {
	if (!row) return null;

	return {
		store: row.shop ?? null,
		ttdNumber: row.no_ttd ?? null,
		ttdDate: row.tgl_ttd ?? null,
		nrb: row.no_nrb ?? null,
		nrbDate: row.tgl_nrb ?? null,
		totalRec: row.tot_rec ?? null,
		receivedDate: row.tgl_terima ?? null,
		totalItemRetur: row.tot_item_retur ?? null,
		attendanceFlag: row.flag_absensi ?? null,
		deliveryVan: row.no_delivery_van ?? null,
		sjNumber: row.no_sj ?? null,
		sjDate: row.tgl_sj ?? null,
		driverNik: row.nik_driver_1 ?? null,
		driverName: row.nama_driver_1 ?? null,
		totalKoli: row.jml_koli ?? null,
		totalContainer: row.jml_cont ?? null,
		nrbBarcode: row.barcode_nrb ?? null,
		koliChecked: row.cek_koli ?? null,
		containerChecked: row.cek_cont ?? null,
		checkerUser: row.user_checker ?? null,
		checkerNik: row.nik_checker ?? null
	};
}

/**
 * Ambil objek baris dari response API.
 * Backend mengembalikan objek tunggal, namun tetap ditangani jika dibungkus `data`.
 * @param {any} response
 * @returns {object | null}
 */
function unwrapRow(response) {
	if (!response) return null;
	if (Array.isArray(response)) return response[0] ?? null;
	if (response.data && !Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.data)) return response.data[0] ?? null;
	return response;
}

// =============================================================================
// CHECK TTD RETUR TOKO
// =============================================================================

/**
 * POST /main/returtoko/checkttd
 * Body  : { nrb, tgl, store }
 * Return: { success: true, data: object } | { success: false, message: string }
 *
 * @param {{ nrb: string, tgl: string, store: string }} params
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function checkTTDRetok({ nrb, tgl, store }) {
	try {
		const res = await apiFetch('checkttd', {
			method: 'POST',
			body: JSON.stringify({ nrb, tgl, store })
		});

		const row = unwrapRow(res);

		if (!row) {
			return { success: false, message: 'Data TTD retur toko tidak ditemukan' };
		}

		logger.info(
			`[ttdRetokService] Data TTD ditemukan untuk NRB ${nrb}, tanggal ${tgl}, toko ${store}`
		);

		return { success: true, data: normalizeTTDRetok(row) };
	} catch (err) {
		const message = err?.message ?? 'Gagal mengambil data TTD retur toko';

		// Backend mengembalikan pesan "No data found" saat baris tidak ada.
		if (/no data found/i.test(message)) {
			return { success: false, message: 'Data TTD retur toko tidak ditemukan' };
		}

		logger.error(`[ttdRetokService] checkTTDRetok gagal: ${message}`);
		return { success: false, message };
	}
}
