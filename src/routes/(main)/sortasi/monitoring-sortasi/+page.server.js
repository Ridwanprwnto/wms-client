import { getMonitoringSortasi } from '$lib/services/monitoringSortasiService';
import { error } from '@sveltejs/kit';

export async function load({ url }) {
	try {
		const date = url.searchParams.get('date');
		const method = url.searchParams.get('method') || 'all';
		const response = await getMonitoringSortasi(date);
		
		if (response && response.status === 'success') {
			return {
				monitoringData: response.data || [],
				selectedDate: date,
				selectedMethod: method
			};
		}
		
		return {
			monitoringData: [],
			selectedDate: date,
			selectedMethod: method
		};
	} catch (err) {
		console.error('[MonitoringSortasi Page Load Error]', err);
		throw error(500, {
			message: 'Gagal memuat data monitoring sortasi',
			details: err.message
		});
	}
}
