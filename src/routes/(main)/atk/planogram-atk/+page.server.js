// Dummy data master planogram
let typePlanoData = [
	{ id: 1, type: 'RACK' },
	{ id: 2, type: 'FLOOR' }
];

let masterPlanoData = [
	{ id: 1, line: 'AA', type_id: 1 },
	{ id: 2, line: 'AB', type_id: 1 },
	{ id: 3, line: 'AC', type_id: 1 },
	{ id: 4, line: 'ZA', type_id: 2 },
	{ id: 5, line: 'ZB', type_id: 2 }
];

let linePlanoData = [
	{ id: 1, rack: '01', shelf: '1', cell: '1', loc: null, master_id: 1 },
	{ id: 2, rack: '01', shelf: '1', cell: '2', loc: null, master_id: 1 },
	{ id: 3, rack: '02', shelf: '1', cell: '1', loc: null, master_id: 1 },
	{ id: 4, rack: null, shelf: null, cell: null, loc: '1', master_id: 4 },
	{ id: 5, rack: null, shelf: null, cell: null, loc: '2', master_id: 4 },
	{ id: 6, rack: null, shelf: null, cell: null, loc: '1', master_id: 5 }
];

// Auto increment ID (integer)
let masterPlanoNextId = 6;
let linePlanoNextId = 7;

// ===================== VALIDASI HELPERS =====================
const LINE_REGEX = /^[A-Z]{2}$/;
const RACK_REGEX = /^\d{2}$/;
const SHELF_REGEX = /^[1-9]$/;
const CELL_REGEX = /^([1-9]|[1-9]\d)$/; // 1-99
const LOC_REGEX = /^([1-9]|[1-9]\d)$/; // 1-99

function validateLine(line) {
	if (!line) return 'Line wajib diisi';
	if (!LINE_REGEX.test(line)) return 'Line harus tepat 2 huruf kapital (A-Z)';
}

function validateRack(rack) {
	if (!rack) return 'Rack wajib diisi';
	if (!RACK_REGEX.test(rack)) return 'Rack harus 2 digit angka (00-99)';
}

function validateShelf(shelf) {
	if (!shelf) return undefined;
	if (!SHELF_REGEX.test(shelf)) return 'Shelf harus 1 digit angka (1-9)';
}

function validateCell(cell) {
	if (!cell) return undefined;
	if (!CELL_REGEX.test(cell)) return 'Cell harus angka 1-99';
}

function validateLoc(loc) {
	if (!loc) return 'Loc wajib diisi';
	if (!LOC_REGEX.test(loc)) return 'Loc harus angka 1-99';
}

/**
 * Cek duplikat lokasi dalam satu master_id.
 * - RACK: kombinasi rack + shelf + cell harus unik
 * - FLOOR: loc harus unik
 */
function isDuplicateLinePlano(master_id, { rack, shelf, cell, loc }, excludeId = null) {
	return linePlanoData.some((lp) => {
		if (lp.master_id !== master_id) return false;
		if (excludeId !== null && lp.id === excludeId) return false;
		if (rack) {
			return (
				lp.rack === rack && (lp.shelf || '') === (shelf || '') && (lp.cell || '') === (cell || '')
			);
		} else {
			return lp.loc === loc;
		}
	});
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		typePlano: typePlanoData,
		masterPlano: masterPlanoData,
		linePlano: linePlanoData
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	// ============ MASTER PLANOGRAM ACTIONS ============
	createMasterPlano: async ({ request }) => {
		const formData = await request.formData();
		const line = formData.get('line')?.toString().trim().toUpperCase();
		const type_id = Number(formData.get('type_id'));
		const linePlano_data = formData.get('linePlano_data');

		const lineErr = validateLine(line);
		if (lineErr) return { success: false, message: lineErr };

		const typeExists = typePlanoData.some((t) => t.id === type_id);
		if (!typeExists) return { success: false, message: 'Type tidak valid' };

		const isDuplicate = masterPlanoData.some((m) => m.line === line);
		if (isDuplicate) return { success: false, message: `Line "${line}" sudah digunakan` };

		const newId = masterPlanoNextId++;
		const newMasterPlano = { id: newId, line, type_id };
		masterPlanoData.push(newMasterPlano);

		if (linePlano_data) {
			try {
				const linePlanoList = JSON.parse(linePlano_data);
				const type = typePlanoData.find((t) => t.id === type_id);

				for (const lp of linePlanoList) {
					if (type?.type === 'RACK') {
						if (validateRack(lp.rack) || validateShelf(lp.shelf) || validateCell(lp.cell)) continue;
					} else if (type?.type === 'FLOOR') {
						if (validateLoc(lp.loc)) continue;
					}
					linePlanoData.push({
						id: linePlanoNextId++,
						rack: lp.rack || null,
						shelf: lp.shelf || null,
						cell: lp.cell || null,
						loc: lp.loc || null,
						master_id: newId
					});
				}
			} catch (error) {
				console.error('Error parsing line plano data:', error);
			}
		}

		return { success: true, message: 'Master Planogram berhasil ditambahkan' };
	},

	updateMasterPlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const line = formData.get('line')?.toString().trim().toUpperCase();
		const type_id = Number(formData.get('type_id'));

		const lineErr = validateLine(line);
		if (lineErr) return { success: false, message: lineErr };

		const typeExists = typePlanoData.some((t) => t.id === type_id);
		if (!typeExists) return { success: false, message: 'Type tidak valid' };

		const isDuplicate = masterPlanoData.some((m) => m.line === line && m.id !== id);
		if (isDuplicate) return { success: false, message: `Line "${line}" sudah digunakan` };

		const index = masterPlanoData.findIndex((item) => item.id === id);
		if (index === -1) return { success: false, message: 'Master Planogram tidak ditemukan' };

		masterPlanoData[index] = { ...masterPlanoData[index], line, type_id };
		return { success: true, message: 'Master Planogram berhasil diupdate' };
	},

	deleteMasterPlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		masterPlanoData = masterPlanoData.filter((item) => item.id !== id);
		linePlanoData = linePlanoData.filter((item) => item.master_id !== id);

		return { success: true, message: 'Master Planogram berhasil dihapus' };
	},

	// ============ LINE PLANOGRAM ACTIONS ============
	createLinePlano: async ({ request }) => {
		const formData = await request.formData();
		const master_id = Number(formData.get('master_id'));
		const rack = formData.get('rack')?.toString().trim() || null;
		const shelf = formData.get('shelf')?.toString().trim() || null;
		const cell = formData.get('cell')?.toString().trim() || null;
		const loc = formData.get('loc')?.toString().trim() || null;

		const master = masterPlanoData.find((m) => m.id === master_id);
		if (!master) return { success: false, message: 'Master Planogram tidak ditemukan' };

		const type = typePlanoData.find((t) => t.id === master.type_id);

		if (type?.type === 'RACK') {
			const rackErr = validateRack(rack);
			if (rackErr) return { success: false, message: rackErr };
			const shelfErr = validateShelf(shelf);
			if (shelfErr) return { success: false, message: shelfErr };
			const cellErr = validateCell(cell);
			if (cellErr) return { success: false, message: cellErr };

			if (isDuplicateLinePlano(master_id, { rack, shelf, cell, loc: null })) {
				return {
					success: false,
					message: `Kombinasi Rack-Shelf-Cell ini sudah ada pada Line ${master.line}`
				};
			}
		} else if (type?.type === 'FLOOR') {
			const locErr = validateLoc(loc);
			if (locErr) return { success: false, message: locErr };

			if (isDuplicateLinePlano(master_id, { rack: null, shelf: null, cell: null, loc })) {
				return { success: false, message: `Loc "${loc}" sudah ada pada Line ${master.line}` };
			}
		} else {
			if (!rack && !loc) return { success: false, message: 'Rack atau Loc harus diisi' };
		}

		linePlanoData.push({ id: linePlanoNextId++, master_id, rack, shelf, cell, loc });
		return { success: true, message: 'Line Planogram berhasil ditambahkan' };
	},

	updateLinePlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const master_id = Number(formData.get('master_id'));
		const rack = formData.get('rack')?.toString().trim() || null;
		const shelf = formData.get('shelf')?.toString().trim() || null;
		const cell = formData.get('cell')?.toString().trim() || null;
		const loc = formData.get('loc')?.toString().trim() || null;

		const master = masterPlanoData.find((m) => m.id === master_id);
		if (!master) return { success: false, message: 'Master Planogram tidak ditemukan' };

		const type = typePlanoData.find((t) => t.id === master.type_id);

		if (type?.type === 'RACK') {
			const rackErr = validateRack(rack);
			if (rackErr) return { success: false, message: rackErr };
			const shelfErr = validateShelf(shelf);
			if (shelfErr) return { success: false, message: shelfErr };
			const cellErr = validateCell(cell);
			if (cellErr) return { success: false, message: cellErr };

			if (isDuplicateLinePlano(master_id, { rack, shelf, cell, loc: null }, id)) {
				return {
					success: false,
					message: `Kombinasi Rack-Shelf-Cell ini sudah ada pada Line ${master.line}`
				};
			}
		} else if (type?.type === 'FLOOR') {
			const locErr = validateLoc(loc);
			if (locErr) return { success: false, message: locErr };

			if (isDuplicateLinePlano(master_id, { rack: null, shelf: null, cell: null, loc }, id)) {
				return { success: false, message: `Loc "${loc}" sudah ada pada Line ${master.line}` };
			}
		} else {
			if (!rack && !loc) return { success: false, message: 'Rack atau Loc harus diisi' };
		}

		const index = linePlanoData.findIndex((item) => item.id === id);
		if (index === -1) return { success: false, message: 'Line Planogram tidak ditemukan' };

		linePlanoData[index] = { id, master_id, rack, shelf, cell, loc };
		return { success: true, message: 'Line Planogram berhasil diupdate' };
	},

	deleteLinePlano: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		linePlanoData = linePlanoData.filter((item) => item.id !== id);
		return { success: true, message: 'Line Planogram berhasil dihapus' };
	},

	// ============ CSV IMPORT ACTION ============
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

		let inserted = 0;
		let skipped = 0;

		for (const row of rows) {
			// Hanya proses baris yang sudah divalidasi 'valid' di frontend
			// Lakukan validasi ulang di server sebagai layer keamanan
			const master = masterPlanoData.find((m) => m.id === row.master_id);
			if (!master) {
				skipped++;
				continue;
			}

			const type = typePlanoData.find((t) => t.id === master.type_id);
			const rack = row.rack || null;
			const shelf = row.shelf || null;
			const cell = row.cell || null;
			const loc = row.loc || null;

			if (type?.type === 'RACK') {
				if (validateRack(rack) || validateShelf(shelf) || validateCell(cell)) {
					skipped++;
					continue;
				}
				if (isDuplicateLinePlano(master.id, { rack, shelf, cell, loc: null })) {
					skipped++;
					continue;
				}
			} else if (type?.type === 'FLOOR') {
				if (validateLoc(loc)) {
					skipped++;
					continue;
				}
				if (isDuplicateLinePlano(master.id, { rack: null, shelf: null, cell: null, loc })) {
					skipped++;
					continue;
				}
			} else {
				skipped++;
				continue;
			}

			linePlanoData.push({
				id: linePlanoNextId++,
				master_id: master.id,
				rack,
				shelf,
				cell,
				loc
			});
			inserted++;
		}

		return {
			success: true,
			message: `Import selesai: ${inserted} berhasil, ${skipped} dilewati`,
			data: { inserted, skipped }
		};
	}
};
