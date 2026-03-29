// src/lib/services/atkService.js
import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_WMS } from '$env/static/private';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Helper generik: kirim POST JSON ke backend WMS.
 * @param {string} endpoint  - path relatif, contoh '/main/atk/produk'
 * @param {object} body      - payload JSON
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
async function postJson(endpoint, body) {
	const url = buildApiUrl('WMS', `/main/atk/master/${endpoint}`);
	logger.info(`[atkService] POST ${url}`, { body });

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			apikey: API_KEY_WMS
		},
		body: JSON.stringify(body)
	});

	const text = await res.text();
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		logger.error(`[atkService] Gagal parse JSON dari ${endpoint}`, { text });
		data = null;
	}

	if (!res.ok) {
		logger.error(`[atkService] ${endpoint} status ${res.status}`, { data });
		return { success: false, message: data?.message || `Request gagal (${res.status})` };
	}

	return { success: true, data };
}

/**
 * Helper generik: kirim FormData (multipart) ke backend WMS.
 * Dipakai untuk upload CSV — backend menerima file sebagai multipart/form-data.
 * @param {string}   endpoint
 * @param {FormData} formData
 * @returns {Promise<{ success: boolean, inserted?: number, message?: string }>}
 */
async function postFormData(endpoint, formData) {
	const url = buildApiUrl('WMS', `/main/atk/master/${endpoint}`);
	logger.info(`[atkService] POST (multipart) ${url}`);

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			// Content-Type TIDAK di-set manual → browser/Node otomatis set boundary
			apikey: API_KEY_WMS
		},
		body: formData
	});

	const text = await res.text();
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		logger.error(`[atkService] Gagal parse JSON dari ${endpoint}`, { text });
		data = null;
	}

	if (!res.ok) {
		logger.error(`[atkService] ${endpoint} status ${res.status}`, { data });
		return { success: false, message: data?.message || `Upload gagal (${res.status})` };
	}

	logger.info(`[atkService] Upload ${endpoint} berhasil`, { inserted: data?.inserted });
	return { success: true, inserted: data?.inserted ?? 0, message: data?.message };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — Ambil data master
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil data master produk.
 * @param {string} officeId
 * @param {string} masterProduk - kode master produk, contoh 'PRODMAST'
 */
export async function getProduk(officeId, masterProduk) {
	return postJson('produk', { office: officeId, master: masterProduk });
}

/**
 * Ambil data master supplier.
 * @param {string} officeId
 * @param {string} masterSupplier - kode master supplier, contoh 'SUPMAST'
 */
export async function getSupplier(officeId, masterSupplier) {
	return postJson('supplier', { office: officeId, master: masterSupplier });
}

/**
 * Ambil data master stock.
 * @param {string} officeId
 * @param {string} masterStock - kode master stock, contoh 'STMAST'
 */
export async function getStock(officeId, masterStock) {
	return postJson('stock', { office: officeId, master: masterStock });
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD — Kirim CSV ke backend
// Setiap fungsi menerima File object (dari server-side FormData SvelteKit)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload CSV master produk.
 * Separator : pipe (|)
 * @param {File}   file
 * @param {string} officeId
 */
export async function uploadProduk(file, officeId) {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('office', officeId);
	return postFormData('upload/produk', fd);
}

/**
 * Upload CSV master supplier.
 * Separator : pipe (|)
 * @param {File} file
 * @param {string} officeId
 */
export async function uploadSupplier(file, officeId) {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('office', officeId);
	return postFormData('upload/supplier', fd);
}

/**
 * Upload CSV master stock.
 * Separator : pipe (|)
 * @param {File} file
 * @param {string} officeId
 */
export async function uploadStock(file, officeId) {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('office', officeId);
	return postFormData('upload/stock', fd);
}
