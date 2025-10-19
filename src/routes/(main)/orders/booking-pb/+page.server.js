// src/routes/booking-pb/+page.server.js
import { getBookingPBService, submitUpdateBookingPBService } from '$lib/services/bookingSplitPB.js';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	// Ambil data dari session/locals
	const pageId = url.pathname;

	return {
		pageId
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Action untuk get table lokasi planogram
	 */
	getTableSplitPB: async ({ request }) => {
		const formData = await request.formData();
		const date = formData.get('date');
		const nopick = formData.get('nopick');
		const pluid = formData.get('pluid');

		const result = await getBookingPBService(date, nopick, pluid);

		if (!result.success) {
			return fail(400, {
				error: result.message,
				success: false
			});
		}

		return {
			success: true,
			data: result.data
		};
	},

	/**
	 * Action untuk submit
	 */
	submit: async ({ request }) => {
		const formData = await request.formData();

		const storeSplit = formData.get('storeSplit');

		// Validation
		if (!storeSplit || storeSplit.length === 0) {
			return fail(400, { error: 'Belum ada data booking PB yang diload' });
		}

		const seqNoSplit = formData.get('seqNoSplit');

		// Build payload
		const payload = {
			pluId: formData.get('pluId'),
			line: formData.get('lineSplit'),
			ip: formData.get('ipDPDSplit'),
			id: formData.get('idDPDSplit')
		};

		const result = await submitUpdateBookingPBService(payload, seqNoSplit);

		if (!result.success) {
			return fail(400, {
				error: result.message,
				success: false
			});
		}

		return {
			success: true,
			message: result.message,
			data: result.data
		};
	}
};
