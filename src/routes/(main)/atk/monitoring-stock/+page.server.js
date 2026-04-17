import { stockService } from '$lib/services/stockService.js';
import { logger } from '$lib/utils/logger.js';
import { fail } from '@sveltejs/kit';

function serializeError(err) {
	if (!err) return 'Unknown error';
	if (typeof err === 'string') return err;
	if (err instanceof Error) return err.message;
	if (err.message) return String(err.message);
	try { return JSON.stringify(err); } catch { return String(err); }
}

const EMPTY_SUMMARY = { totalItems: 0, totalStock: 0, totalPlano: 0, totalVariance: 0 };
const EMPTY_PAGINATION = { total: 0, page: 1, limit: 10, totalPages: 0 };

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const search = url.searchParams.get('search') ?? '';
	const page   = parseInt(url.searchParams.get('page')  ?? '1');
	const limit  = parseInt(url.searchParams.get('limit') ?? '10');

	try {
		const stockData = await stockService.getStocks({ search, page, limit });

		return {
			stocks:     stockData?.data       ?? [],
			pagination: stockData?.pagination ?? EMPTY_PAGINATION,
			summary:    stockData?.summary    ?? EMPTY_SUMMARY,
			filters:    { search, page, limit }
		};
	} catch (err) {
		logger.error(`[stock/load] Gagal memuat data stok: ${serializeError(err)}`);
		return {
			stocks:     [],
			pagination: EMPTY_PAGINATION,
			summary:    EMPTY_SUMMARY,
			filters:    { search, page, limit },
			error:      'Gagal memuat data stok. Silakan coba lagi.'
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Server action: ambil seluruh data stok untuk di-export sebagai Excel.
	 * Dipanggil via fetch dari +page.svelte.
	 */
	exportStocks: async ({ request }) => {
		try {
			const formData = await request.formData();
			const search = (formData.get('search') ?? '').toString().trim();

			const result = await stockService.exportStocks({ search });

			return { success: true, data: result?.data ?? [] };
		} catch (err) {
			logger.error(`[stock/action/exportStocks] ${serializeError(err)}`);
			return fail(500, { success: false, error: serializeError(err) });
		}
	}
};