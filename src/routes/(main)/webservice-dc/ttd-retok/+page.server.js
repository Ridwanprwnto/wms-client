// src/routes/(main)/webservice-dc/ttd-retok/+page.server.js
import { fail } from '@sveltejs/kit';
import { checkTTDRetok } from '$lib/services/ttdRetokService.js';
import { logger } from '$lib/utils/logger.js';

/**
 * Validasi string tanggal dengan format YYYY-MM-DD dan tanggal yang benar-benar valid.
 * @param {string} value
 * @returns {boolean}
 */
function isValidDateString(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	);
}

/**
 * Konversi tanggal dari input HTML (YYYY-MM-DD) ke format kolom database (MM/DD/YYYY).
 * @param {string} value - format YYYY-MM-DD
 * @returns {string} format MM/DD/YYYY
 */
function toDatabaseDate(value) {
	const [year, month, day] = value.split('-');
	return `${month}/${day}/${year}`;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	return {
		officeId: locals.user?.officecode || '',
		userId: locals.user?.id || '',
		pageId: url.pathname
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Action pengecekan data TTD retur toko.
	 * Body form: nrb, tgl (YYYY-MM-DD), store
	 */
	checkTTD: async ({ request }) => {
		const formData = await request.formData();

		const nrb = String(formData.get('nrb') ?? '').trim();
		const tgl = String(formData.get('tgl') ?? '').trim();
		const store = String(formData.get('store') ?? '').trim();

		if (!nrb || !tgl || !store) {
			return fail(400, {
				success: false,
				error: 'NRB, tanggal, dan toko wajib diisi'
			});
		}

		if (!isValidDateString(tgl)) {
			return fail(400, {
				success: false,
				error: 'Format tanggal tidak valid'
			});
		}

		if (!/^\d+$/.test(nrb)) {
			return fail(400, {
				success: false,
				error: 'No. NRB harus berupa angka'
			});
		}

		const tglDb = toDatabaseDate(tgl);

		logger.info(`[ttd-retok] Pengecekan TTD: NRB=${nrb}, tanggal=${tglDb}, toko=${store}`);

		const result = await checkTTDRetok({ nrb, tgl: tglDb, store });

		if (!result.success) {
			return fail(400, {
				success: false,
				error: result.message || 'Data TTD retur toko tidak ditemukan'
			});
		}

		return {
			success: true,
			data: result.data
		};
	}
};
