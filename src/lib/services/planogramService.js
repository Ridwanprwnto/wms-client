// src/lib/services/planogramService.js

import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_WMS } from '$env/static/private';

// =============================================================================
// HELPER: FETCH
// =============================================================================
async function apiFetch(subPath, options = {}) {
	const url = buildApiUrl('WMS', `/main/atk/planogram/${subPath}`);

	logger.info(`[planogramService] ${options.method || 'GET'} ${url}`);

	const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			apikey: API_KEY_WMS,
			...(options.headers || {})
		}
	});

	if (!res.ok) {
		let errMsg = `API error ${res.status} pada ${url}`;
		try {
			const body = await res.json();
			errMsg = body.error || body.message || errMsg;
		} catch {
			/* body bukan JSON */
		}
		logger.error(`[planogramService] ${errMsg}`);
		throw new Error(errMsg);
	}

	const text = await res.text();
	if (!text || text.trim() === '') return null;

	try {
		return JSON.parse(text);
	} catch {
		logger.error(`[planogramService] Response bukan JSON valid: ${text.slice(0, 200)}`);
		throw new Error('Response dari server bukan format JSON yang valid');
	}
}

// =============================================================================
// HELPER: NORMALIZER
// Memetakan field DB (snake_case dengan suffix) → field UI (singkat)
//
// DB field          →  UI field
// ─────────────────────────────────────────────────────────
// TYPE:
//   id_type_plano   →  id
//   name_type_plano →  type
//
// MASTER:
//   id_master_plano      →  id
//   head_id_type_plano   →  type_id
//   line_master_plano    →  line
//
// LINE:
//   id_plano              →  id
//   head_id_master_plano  →  master_id
//   rack_plano            →  rack
//   shelf_plano           →  shelf
//   cell_plano            →  cell
//   loc_plano             →  loc
//   prdcd_plano           →  prdcd
//   line_master_plano     →  line  (dari JOIN)
// =============================================================================

function unwrapArray(response) {
	if (!response) return [];
	if (Array.isArray(response)) return response;
	if (Array.isArray(response.data)) return response.data;
	return [];
}

function unwrapSingle(response) {
	if (!response) return null;
	if (response.data && !Array.isArray(response.data)) return response.data;
	if (response.data && Array.isArray(response.data)) return response.data[0] ?? null;
	return response;
}

function normalizeTypePlano(item) {
	if (!item) return null;
	return {
		id: item.id_type_plano,
		type: item.name_type_plano
	};
}

function normalizeMasterPlano(item) {
	if (!item) return null;
	return {
		id: item.id_master_plano,
		type_id: item.head_id_type_plano,
		line: item.line_master_plano
	};
}

function normalizeLinePlano(item) {
	if (!item) return null;
	return {
		id: item.id_plano,
		master_id: item.head_id_master_plano,
		rack: item.rack_plano ?? null,
		shelf: item.shelf_plano ?? null,
		cell: item.cell_plano ?? null,
		loc: item.loc_plano ?? null,
		prdcd: item.prdcd_plano ?? null,
		line: item.line_master_plano ?? null // dari JOIN
	};
}

// =============================================================================
// TYPE PLANOGRAM
// =============================================================================

/**
 * GET /main/atk/planogram/types
 * Response DB : [{ id_type_plano, name_type_plano }]
 * Return UI   : [{ id, type }]
 */
export async function fetchTypePlano() {
	const res = await apiFetch('types');
	return unwrapArray(res).map(normalizeTypePlano);
}

// =============================================================================
// MASTER PLANOGRAM
// =============================================================================

/**
 * GET /main/atk/planogram/masters
 * Response DB : [{ id_master_plano, head_id_type_plano, line_master_plano }]
 * Return UI   : [{ id, type_id, line }]
 */
export async function fetchMasterPlano() {
	const res = await apiFetch('masters');
	return unwrapArray(res).map(normalizeMasterPlano);
}

/**
 * POST /main/atk/planogram/masters
 * Body UI  : { line, type_id, line_plano? }
 * Body API : { line_master_plano, type_id, line_plano? }
 *            line_plano item: { rack_plano, shelf_plano, cell_plano, loc_plano }
 * Return UI: { id, type_id, line }
 */
export async function createMasterPlano({ line, type_id, line_plano = [] }) {
	const res = await apiFetch('masters', {
		method: 'POST',
		body: JSON.stringify({
			type_id,
			line_master_plano: line,
			line_plano: line_plano.map((lp) => ({
				rack_plano: lp.rack || null,
				shelf_plano: lp.shelf || null,
				cell_plano: lp.cell || null,
				loc_plano: lp.loc || null
			}))
		})
	});
	return normalizeMasterPlano(unwrapSingle(res)?.master ?? unwrapSingle(res));
}

/**
 * PUT /main/atk/planogram/masters/:id
 * Body UI  : { line, type_id }
 * Body API : { line_master_plano }
 * (type_id tidak dikirim — tidak boleh diubah sesuai aturan bisnis)
 * Return UI: { id, type_id, line }
 */
export async function updateMasterPlano(id, { line }) {
	const res = await apiFetch(`masters/${id}`, {
		method: 'PUT',
		body: JSON.stringify({ line_master_plano: line })
	});
	return normalizeMasterPlano(unwrapSingle(res));
}

/**
 * DELETE /main/atk/planogram/masters/:id
 * Return: null
 */
export async function deleteMasterPlano(id) {
	return apiFetch(`masters/${id}`, { method: 'DELETE' });
}

// =============================================================================
// LINE PLANOGRAM
// =============================================================================

/**
 * GET /main/atk/planogram/lines
 * Response DB : [{ id_plano, head_id_master_plano, rack_plano, shelf_plano,
 *                  cell_plano, loc_plano, prdcd_plano, line_master_plano }]
 * Return UI   : [{ id, master_id, rack, shelf, cell, loc, prdcd, line }]
 */
export async function fetchLinePlano() {
	const res = await apiFetch('lines');
	return unwrapArray(res).map(normalizeLinePlano);
}

/**
 * GET /main/atk/planogram/lines?master_id=:masterId
 * Return UI : [{ id, master_id, rack, shelf, cell, loc, prdcd, line }]
 */
export async function fetchLinePlanoByMaster(masterId) {
	const res = await apiFetch(`lines?master_id=${masterId}`);
	return unwrapArray(res).map(normalizeLinePlano);
}

/**
 * POST /main/atk/planogram/lines
 * Body UI  : { master_id, rack, shelf, cell, loc }
 * Body API : { head_id_master_plano, rack_plano, shelf_plano, cell_plano, loc_plano }
 * Return UI: { id, master_id, rack, shelf, cell, loc }
 */
export async function createLinePlano({ master_id, rack, shelf, cell, loc }) {
	const res = await apiFetch('lines', {
		method: 'POST',
		body: JSON.stringify({
			head_id_master_plano: master_id,
			rack_plano: rack || null,
			shelf_plano: shelf || null,
			cell_plano: cell || null,
			loc_plano: loc || null
		})
	});
	return normalizeLinePlano(unwrapSingle(res));
}

/**
 * PUT /main/atk/planogram/lines/:id
 * Body UI  : { master_id, rack, shelf, cell, loc }
 * Body API : { head_id_master_plano, rack_plano, shelf_plano, cell_plano, loc_plano }
 * Return UI: { id, master_id, rack, shelf, cell, loc }
 */
export async function updateLinePlano(id, { master_id, rack, shelf, cell, loc }) {
	const res = await apiFetch(`lines/${id}`, {
		method: 'PUT',
		body: JSON.stringify({
			head_id_master_plano: master_id,
			rack_plano: rack || null,
			shelf_plano: shelf || null,
			cell_plano: cell || null,
			loc_plano: loc || null
		})
	});
	return normalizeLinePlano(unwrapSingle(res));
}

/**
 * DELETE /main/atk/planogram/lines/:id
 * Return: null
 */
export async function deleteLinePlano(id) {
	return apiFetch(`lines/${id}`, { method: 'DELETE' });
}

/**
 * POST /main/atk/planogram/lines/bulk
 * Body UI  : rows[] { master_id, rack, shelf, cell, loc }
 * Body API : rows[] { head_id_master_plano, rack_plano, shelf_plano, cell_plano, loc_plano }
 * Return   : { inserted, skipped }
 */
export async function importLinePlanoBulk(rows) {
	const res = await apiFetch('lines/bulk', {
		method: 'POST',
		body: JSON.stringify({
			rows: rows.map((r) => ({
				head_id_master_plano: r.master_id,
				rack_plano: r.rack || null,
				shelf_plano: r.shelf || null,
				cell_plano: r.cell || null,
				loc_plano: r.loc || null
			}))
		})
	});

	const result = unwrapSingle(res) ?? res ?? {};
	return {
		inserted: result.inserted ?? 0,
		skipped: result.skipped ?? 0
	};
}
