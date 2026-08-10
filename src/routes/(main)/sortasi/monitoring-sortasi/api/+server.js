import { json } from '@sveltejs/kit';
import { getMonitoringSortasiDetails } from '$lib/services/monitoringSortasiService';

/**
 * GET /sortasi/monitoring-sortasi/api?nopick=xxx
 * SvelteKit server-side proxy agar $env/static/private tidak bocor ke client.
 */
export async function GET({ url }) {
	const nopick = url.searchParams.get('nopick');

	if (!nopick) {
		return json({ status: 'error', message: 'nopick diperlukan' }, { status: 400 });
	}

	try {
		const response = await getMonitoringSortasiDetails(nopick);
		return json(response);
	} catch (err) {
		console.error('[API /monitoring-sortasi/api] Error:', err.message);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
