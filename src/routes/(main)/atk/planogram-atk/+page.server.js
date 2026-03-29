// src/routes/(your-route)/+page.server.js

import {
	fetchTypePlano,
	fetchMasterPlano,
	fetchLinePlano,
	createMasterPlano,
	updateMasterPlano,
	deleteMasterPlano,
	createLinePlano,
	updateLinePlano,
	deleteLinePlano,
	importLinePlanoBulk
} from '$lib/services/planogramService.js';

import { logger } from '$lib/utils/logger.js';

// =============================================================================
// HELPER: ERROR SERIALIZER
// Logger kadang tidak bisa membaca err.message jika yang dilempar bukan
// instance Error standar (misal plain object atau string).
// Fungsi ini memastikan pesan error selalu terbaca.
// =============================================================================
function serializeError(err) {
	if (!err) return 'Unknown error';
	if (typeof err === 'string') return err;
	if (err instanceof Error) return err.message;
	// Plain object (misal { message: '...' } dari API)
	if (err.message) return String(err.message);
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
}

// =============================================================================
// VALIDASI HELPERS
// =============================================================================
const LINE_REGEX = /^[A-Z]{2}$/;
const RACK_REGEX = /^\d{2}$/;
const SHELF_REGEX = /^[1-9]$/;
const CELL_REGEX = /^([1-9]|[1-9]\d)$/; // 1–99
const LOC_REGEX = /^([1-9]|[1-9]\d)$/; // 1–99

function validateLine(line) {
	if (!line) return 'Line wajib diisi';
	if (!LINE_REGEX.test(line)) return 'Line harus tepat 2 huruf kapital (A-Z)';
}
function validateRack(rack) {
	if (!rack) return 'Rack wajib diisi';
	if (!RACK_REGEX.test(rack)) return 'Rack harus 2 digit angka (00–99)';
}
function validateShelf(shelf) {
	if (!shelf) return undefined;
	if (!SHELF_REGEX.test(shelf)) return 'Shelf harus 1 digit angka (1–9)';
}
function validateCell(cell) {
	if (!cell) return undefined;
	if (!CELL_REGEX.test(cell)) return 'Cell harus angka 1–99';
}
function validateLoc(loc) {
	if (!loc) return 'Loc wajib diisi';
	if (!LOC_REGEX.test(loc)) return 'Loc harus angka 1–99';
}

// =============================================================================
// LOAD
// Menggunakan Promise.allSettled agar:
// - Satu endpoint 404 tidak menggagalkan semua data lain yang berhasil
// - Error per-endpoint terlog secara spesifik dengan pesan yang jelas
// =============================================================================
/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const [typeResult, masterResult, lineResult] = await Promise.allSettled([
		fetchTypePlano(),
		fetchMasterPlano(),
		fetchLinePlano()
	]);

	// Log error per endpoint dengan pesan yang jelas
	if (typeResult.status === 'rejected') {
		logger.error(`[load] fetchTypePlano gagal: ${serializeError(typeResult.reason)}`);
	}
	if (masterResult.status === 'rejected') {
		logger.error(`[load] fetchMasterPlano gagal: ${serializeError(masterResult.reason)}`);
	}
	if (lineResult.status === 'rejected') {
		logger.error(`[load] fetchLinePlano gagal: ${serializeError(lineResult.reason)}`);
	}

	return {
		typePlano: typeResult.status === 'fulfilled' ? typeResult.value : [],
		masterPlano: masterResult.status === 'fulfilled' ? masterResult.value : [],
		linePlano: lineResult.status === 'fulfilled' ? lineResult.value : []
	};
}

// =============================================================================
// ACTIONS
// =============================================================================
/** @type {import('./$types').Actions} */
export const actions = {
	// ============ MASTER PLANOGRAM ============

	createMasterPlano: async ({ request }) => {
		const formData = await request.formData();
		const line = formData.get('line')?.toString().trim().toUpperCase();
		const type_id = Number(formData.get('type_id'));
		const linePlano_data = formData.get('linePlano_data');

		const lineErr = validateLine(line);
		if (lineErr) return { success: false, message: lineErr };
		if (!type_id) return { success: false, message: 'Type wajib dipilih' };

		let line_plano = [];
		if (linePlano_data) {
			try {
				line_plano = JSON.parse(linePlano_data);
			} catch {
				logger.warn('[createMasterPlano] Gagal parse linePlano_data, diabaikan');
			}
		}

		try {
			await createMasterPlano({ line, type_id, line_plano });
			return { success: true, message: 'Master Planogram berhasil ditambahkan' };
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[createMasterPlano] ${msg}`);
			return { success: false, message: msg };
		}
	},

	updateMasterPlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const line = formData.get('line')?.toString().trim().toUpperCase();
		const type_id = Number(formData.get('type_id'));

		const lineErr = validateLine(line);
		if (lineErr) return { success: false, message: lineErr };
		if (!type_id) return { success: false, message: 'Type wajib dipilih' };

		try {
			await updateMasterPlano(id, { line, type_id });
			return { success: true, message: 'Master Planogram berhasil diupdate' };
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[updateMasterPlano] ${msg}`);
			return { success: false, message: msg };
		}
	},

	deleteMasterPlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			await deleteMasterPlano(id);
			return { success: true, message: 'Master Planogram berhasil dihapus' };
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[deleteMasterPlano] ${msg}`);
			return { success: false, message: msg };
		}
	},

	// ============ LINE PLANOGRAM ============

	createLinePlano: async ({ request }) => {
		const formData = await request.formData();
		const master_id = Number(formData.get('master_id'));
		const rack = formData.get('rack')?.toString().trim() || null;
		const shelf = formData.get('shelf')?.toString().trim() || null;
		const cell = formData.get('cell')?.toString().trim() || null;
		const loc = formData.get('loc')?.toString().trim() || null;

		if (!master_id) return { success: false, message: 'Master Planogram wajib dipilih' };

		if (rack) {
			const rackErr = validateRack(rack);
			if (rackErr) return { success: false, message: rackErr };
			const shelfErr = validateShelf(shelf);
			if (shelfErr) return { success: false, message: shelfErr };
			const cellErr = validateCell(cell);
			if (cellErr) return { success: false, message: cellErr };
		} else if (loc) {
			const locErr = validateLoc(loc);
			if (locErr) return { success: false, message: locErr };
		} else {
			return { success: false, message: 'Rack atau Loc harus diisi' };
		}

		try {
			await createLinePlano({ master_id, rack, shelf, cell, loc });
			return { success: true, message: 'Line Planogram berhasil ditambahkan' };
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[createLinePlano] ${msg}`);
			return { success: false, message: msg };
		}
	},

	updateLinePlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const master_id = Number(formData.get('master_id'));
		const rack = formData.get('rack')?.toString().trim() || null;
		const shelf = formData.get('shelf')?.toString().trim() || null;
		const cell = formData.get('cell')?.toString().trim() || null;
		const loc = formData.get('loc')?.toString().trim() || null;

		if (!master_id) return { success: false, message: 'Master Planogram wajib dipilih' };

		if (rack) {
			const rackErr = validateRack(rack);
			if (rackErr) return { success: false, message: rackErr };
			const shelfErr = validateShelf(shelf);
			if (shelfErr) return { success: false, message: shelfErr };
			const cellErr = validateCell(cell);
			if (cellErr) return { success: false, message: cellErr };
		} else if (loc) {
			const locErr = validateLoc(loc);
			if (locErr) return { success: false, message: locErr };
		} else {
			return { success: false, message: 'Rack atau Loc harus diisi' };
		}

		try {
			await updateLinePlano(id, { master_id, rack, shelf, cell, loc });
			return { success: true, message: 'Line Planogram berhasil diupdate' };
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[updateLinePlano] ${msg}`);
			return { success: false, message: msg };
		}
	},

	deleteLinePlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			await deleteLinePlano(id);
			return { success: true, message: 'Line Planogram berhasil dihapus' };
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[deleteLinePlano] ${msg}`);
			return { success: false, message: msg };
		}
	},

	// ============ CSV IMPORT ============

	importLinePlanoCsv: async ({ request }) => {
		const formData = await request.formData();
		const csvDataRaw = formData.get('csv_data')?.toString();

		if (!csvDataRaw) {
			return { success: false, message: 'Tidak ada data CSV yang dikirim' };
		}

		let rows;
		try {
			rows = JSON.parse(csvDataRaw);
		} catch {
			return { success: false, message: 'Format data CSV tidak valid' };
		}

		if (!Array.isArray(rows) || rows.length === 0) {
			return { success: false, message: 'Tidak ada baris yang valid untuk diimport' };
		}

		// Validasi ulang tiap baris di server (defense-in-depth)
		const validatedRows = [];
		for (const row of rows) {
			const rack = row.rack || null;
			const shelf = row.shelf || null;
			const cell = row.cell || null;
			const loc = row.loc || null;

			if (!row.master_id) continue;

			if (rack) {
				if (validateRack(rack) || validateShelf(shelf) || validateCell(cell)) continue;
			} else if (loc) {
				if (validateLoc(loc)) continue;
			} else {
				continue;
			}

			validatedRows.push({ master_id: row.master_id, rack, shelf, cell, loc });
		}

		if (validatedRows.length === 0) {
			return { success: false, message: 'Semua baris gagal validasi server' };
		}

		try {
			const result = await importLinePlanoBulk(validatedRows);
			return {
				success: true,
				message: `Import selesai: ${result.inserted} berhasil, ${result.skipped} dilewati`,
				data: { inserted: result.inserted, skipped: result.skipped }
			};
		} catch (err) {
			const msg = serializeError(err);
			logger.error(`[importLinePlanoCsv] ${msg}`);
			return { success: false, message: msg };
		}
	}
};
