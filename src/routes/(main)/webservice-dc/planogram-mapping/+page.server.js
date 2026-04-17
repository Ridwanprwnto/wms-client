// +page.server.js
// Data ini nantinya akan diambil dari backend API melalui service layer.
// Untuk sementara menggunakan data dummy.

export async function load() {
	// TODO: Ganti dengan pemanggilan service ke backend API
	// Contoh: const racks = await planogramService.getRacks();

	/** @type {import('./$types').PageServerLoad} */

	// ── Data untuk Tab 1: Move Product ──────────────────────────────────────
	const moveSourceRacks = [
		{ id: 1, address: 'AA-01-1-1', productCode: '10001234', product: 'Minyak Goreng',  cartonPerPallet: 24, ipAddress: '172.31.31.1', deviceId: '1' },
		{ id: 2, address: 'AA-02-1-1', productCode: '10001235', product: 'Gula Pasir',      cartonPerPallet: 30, ipAddress: '172.31.31.1', deviceId: '2' },
		{ id: 3, address: 'AA-03-1-1', productCode: '10001236', product: 'Beras Premium',   cartonPerPallet: 20, ipAddress: '172.31.31.1', deviceId: '3' },
		{ id: 4, address: 'AB-01-1-1', productCode: '10001237', product: 'Susu UHT',        cartonPerPallet: 48, ipAddress: '172.31.31.2', deviceId: '4' },
		{ id: 5, address: 'AB-02-1-1', productCode: '10001238', product: 'Teh Kotak',       cartonPerPallet: 36, ipAddress: '172.31.31.2', deviceId: '5' },
		{ id: 6, address: 'BA-01-1-1', productCode: '10001239', product: 'Kopi Instan',     cartonPerPallet: 40, ipAddress: '172.31.31.3', deviceId: '6' },
		{ id: 7, address: 'BA-02-1-1', productCode: '10001240', product: 'Sirup ABC',       cartonPerPallet: 24, ipAddress: '172.31.31.3', deviceId: '7' }
	];

	const moveTargetRacks = [
		{ id: 101, address: 'CA-01-1-1', productCode: '', product: null, cartonPerPallet: 120, ipAddress: '172.31.31.154', deviceId: '16', sourceId: null },
		{ id: 102, address: 'CA-02-1-1', productCode: '', product: null, cartonPerPallet: 60, ipAddress: '172.31.31.154', deviceId: '17', sourceId: null },
		{ id: 103, address: 'CA-03-1-1', productCode: '', product: null, cartonPerPallet: 1000, ipAddress: '', deviceId: '', sourceId: null },
		{ id: 104, address: 'CB-01-1-1', productCode: '', product: null, cartonPerPallet: 160, ipAddress: '172.31.31.44', deviceId: '14', sourceId: null },
		{ id: 105, address: 'DA-01-1-1', productCode: '', product: null, cartonPerPallet: 90, ipAddress: '172.31.31.45', deviceId: '25', sourceId: null }
	];

	// ── Data untuk Tab 2: Switch Product ────────────────────────────────────
	const switchRacks = [
		{ id: 1, address: 'AA-01-1-1', productCode: '10001234', product: 'Minyak Goreng',  cartonPerPallet: 24, ipAddress: '172.31.31.1', deviceId: '1' },
		{ id: 2, address: 'AA-02-1-1', productCode: '10001235', product: 'Gula Pasir',      cartonPerPallet: 30, ipAddress: '172.31.31.1', deviceId: '2' },
		{ id: 3, address: 'AA-03-1-1', productCode: '10001236', product: 'Beras Premium',   cartonPerPallet: 20, ipAddress: '172.31.31.1', deviceId: '3' },
		{ id: 4, address: 'AB-01-1-1', productCode: '10001237', product: 'Susu UHT',        cartonPerPallet: 48, ipAddress: '172.31.31.2', deviceId: '4' },
		{ id: 5, address: 'AB-02-1-1', productCode: '10001238', product: 'Teh Kotak',       cartonPerPallet: 36, ipAddress: '172.31.31.2', deviceId: '5' },
		{ id: 6, address: 'BA-01-1-1', productCode: '10001239', product: 'Kopi Instan',     cartonPerPallet: 40, ipAddress: '172.31.31.3', deviceId: '6' },
		{ id: 7, address: 'BA-02-1-1', productCode: '10001240', product: 'Sirup ABC',       cartonPerPallet: 24, ipAddress: '172.31.31.3', deviceId: '7' }
	];

	return {
		moveSourceRacks,
		moveTargetRacks,
		switchRacks
	};
}