// src/routes/(main)/atk/master-atk/+page.server.js
import { fail } from '@sveltejs/kit';
import {
	getProduk,
	getSupplier,
	getStock,
	uploadProduk,
	uploadSupplier,
	uploadStock
} from '$lib/services/atkService';
import { logger } from '$lib/utils/logger.js';

// ─── Peta type → fungsi upload service ───────────────────────────────────────
const UPLOAD_HANDLERS = {
	produk: uploadProduk,
	supplier: uploadSupplier,
	stock: uploadStock
};

// ─────────────────────────────────────────────────────────────────────────────
// LOAD
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	const officeId = locals.user?.officecode || '';
	const pageId = url.pathname;

	const master = {
		produk: 'PRODMAST',
		supplier: 'SUPMAST',
		stock: 'STMAST'
	};

	// Fetch semua data master secara paralel
	const [produkResult, supplierResult, stockResult] = await Promise.all([
		getProduk(officeId, master.produk),
		getSupplier(officeId, master.supplier),
		getStock(officeId, master.stock)
	]);

	// Log jika ada yang gagal
	if (!produkResult.success)
		logger.error('[page.server] load: gagal muat produk', produkResult.message);
	if (!supplierResult.success)
		logger.error('[page.server] load: gagal muat supplier', supplierResult.message);
	if (!stockResult.success)
		logger.error('[page.server] load: gagal muat stock', stockResult.message);

	/**
	 * Ekstrak info sinkronisasi dari respons API.
	 * Format respons: { sync: [{ office_sync, date_sync }], data: [...] }
	 * @param {{ success: boolean, data?: any }} result
	 * @returns {{ office_sync: string, date_sync: string } | null}
	 */
	function extractSync(result) {
		if (!result.success) return null;
		const raw = result.data;
		const syncArr = raw?.sync;
		if (!Array.isArray(syncArr) || syncArr.length === 0) return null;
		return syncArr[0] ?? null;
	}

	/**
	 * Ekstrak array data dari respons API.
	 * Mendukung dua format: { sync, data: [...] } atau array langsung.
	 * @param {{ success: boolean, data?: any }} result
	 * @returns {Array}
	 */
	function extractData(result) {
		if (!result.success) return [];
		const raw = result.data;
		if (Array.isArray(raw)) return raw;
		if (Array.isArray(raw?.data)) return raw.data;
		return [];
	}

	return {
		officeId,
		pageId,
		produk: extractData(produkResult),
		supplier: extractData(supplierResult),
		stock: extractData(stockResult),
		// Info sinkronisasi per tab: { office_sync, date_sync } | null
		syncProduk: extractSync(produkResult),
		syncSupplier: extractSync(supplierResult),
		syncStock: extractSync(stockResult)
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Action tunggal yang menangani upload untuk semua tab.
	 * Form wajib mengirimkan:
	 *   - field `type`  : 'produk' | 'harga' | 'supplier' | 'stock'
	 *   - field `file`  : file CSV dengan separator pipe (|)
	 */
	uploadCsv: async ({ request, locals }) => {
		const officeId = locals.user?.officecode || '';

		// ── 1. Parse FormData ─────────────────────────────────────────────────
		let formData;
		try {
			formData = await request.formData();
		} catch {
			return fail(400, { success: false, message: 'Gagal membaca form data.' });
		}

		const type = formData.get('type')?.toString().trim();
		const file = formData.get('file');

		// ── 2. Validasi input ────────────────────────────────────────────────
		if (!type || !(type in UPLOAD_HANDLERS)) {
			return fail(400, {
				success: false,
				message: `Tipe upload tidak valid: "${type}". Gunakan: produk | supplier | stock`
			});
		}

		if (!file || !(file instanceof File) || file.size === 0) {
			return fail(400, { success: false, type, message: 'File CSV tidak ditemukan atau kosong.' });
		}

		if (!file.name.endsWith('.csv')) {
			return fail(422, {
				success: false,
				type,
				message: 'Hanya file dengan ekstensi .csv yang diizinkan.'
			});
		}

		// ── 3. Panggil service yang sesuai ────────────────────────────────────
		logger.info(`[page.server] uploadCsv: type=${type}, file=${file.name}, office=${officeId}`);

		const handler = UPLOAD_HANDLERS[type];
		const result = await handler(file, officeId);

		// ── 4. Return hasil ───────────────────────────────────────────────────
		if (!result.success) {
			logger.error(`[page.server] uploadCsv ${type} gagal:`, result.message);
			return fail(500, {
				success: false,
				type,
				message: result.message || `Gagal mengupload data ${type}.`
			});
		}

		logger.info(`[page.server] uploadCsv ${type} berhasil: ${result.inserted} baris`);
		return {
			success: true,
			type,
			inserted: result.inserted,
			message: `Data ${type} berhasil diupload (${result.inserted} baris diproses).`
		};
	}
};
