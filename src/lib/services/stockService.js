/**
 * Stock Service
 * Place this file at: src/lib/services/stockService.js
 */

import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_WMS } from '$env/static/private';

/**
 * Generic fetch wrapper.
 * @param {string} endpoint
 * @param {RequestInit} [options]
 */
async function apiFetch(endpoint, options = {}) {
	const url = buildApiUrl('WMS', `/main/atk${endpoint}`);

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
		const msg = `[stockService] Network error saat menghubungi ${url}: ${networkErr?.message ?? networkErr}`;
		logger.error(msg);
		throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
	}

	if (!res.ok) {
		let errMsg = `API error ${res.status} pada ${url}`;
		try {
			const body = await res.json();
			errMsg = body.error || body.message || errMsg;
		} catch { /* body bukan JSON */ }
		logger.error(`[stockService] ${errMsg}`);
		throw new Error(errMsg);
	}

	const text = await res.text();
	if (!text || text.trim() === '') return null;

	try {
		return JSON.parse(text);
	} catch {
		logger.error(`[stockService] Response bukan JSON valid dari ${url}: ${text.slice(0, 200)}`);
		throw new Error('Response dari server bukan format JSON yang valid.');
	}
}

// ─────────────────────────────────────────────────────────
// JSDoc Types
// ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} StockFilters
 * @property {string} [search]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * @typedef {'in_stock'|'low_stock'|'out_of_stock'} StockStatus
 *
 * @typedef {Object} StockItem
 * @property {string}      id
 * @property {string}      sku
 * @property {string}      name
 * @property {string}      shortName
 * @property {string}      kemasan
 * @property {number}      quantity     - qty stok saat ini
 * @property {number}      frac         - minimum stok
 * @property {number|null} plano        - total kapasitas planogram (null jika belum ada)
 * @property {number|null} variance     - plano - quantity (null jika plano null)
 * @property {StockStatus} status
 * @property {string|null} lastUpdated
 */

/**
 * @typedef {Object} Pagination
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

/**
 * @typedef {Object} StockSummary
 * @property {number} totalItems
 * @property {number} totalStock
 * @property {number} totalPlano
 * @property {number} totalVariance
 */

/**
 * @typedef {Object} StockListResult
 * @property {StockItem[]}  data
 * @property {Pagination}   pagination
 * @property {StockSummary} summary
 */

// ─────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────

export const stockService = {
	/**
	 * Ambil daftar stok dengan filter & paginasi.
	 * @param {StockFilters} [filters]
	 * @returns {Promise<StockListResult>}
	 */
	async getStocks({ search = '', page = 1, limit = 10 } = {}) {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		params.set('page',  String(page));
		params.set('limit', String(limit));

		logger.info(`[stockService] getStocks — ${params.toString()}`);
		return apiFetch(`/stocks?${params.toString()}`);
	},

	/**
	 * Ambil SELURUH data stok tanpa paginasi (untuk export Excel).
	 * @param {{ search?: string }} [filters]
	 * @returns {Promise<{ success: boolean, data: StockItem[], total: number }>}
	 */
	async exportStocks({ search = '' } = {}) {
		const params = new URLSearchParams();
		if (search) params.set('search', search);

		logger.info(`[stockService] exportStocks — ${params.toString()}`);
		return apiFetch(`/stocks/export?${params.toString()}`);
	},
};