// src//lib/services/masterBarangService.js// src//lib/services/masterItemService.js
import { buildApiUrl } from '$lib/config/apiConfig.js';
import { logger } from '$lib/utils/logger.js';
import { API_KEY_WMS } from '$env/static/private';

// Helper function untuk HTTP request
async function apiRequest(endpoint, options = {}) {
	const url = buildApiUrl('WMS', `${endpoint}`);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	};

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'API request failed');
		}

		return await response.json();
	} catch (error) {
		console.error('API Error:', error);
		throw error;
	}
}

// ============ BARANG API CALLS ============
export async function getBarang() {
	return await apiRequest('/barang', {
		method: 'GET'
	});
}

export async function getBarangById(id) {
	return await apiRequest(`/barang/${id}`, {
		method: 'GET'
	});
}

export async function createBarang(data) {
	return await apiRequest('/barang', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateBarang(id, data) {
	return await apiRequest(`/barang/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
}

export async function deleteBarang(id) {
	return await apiRequest(`/barang/${id}`, {
		method: 'DELETE'
	});
}

// ============ DIMENSI API CALLS ============
export async function getDimensi() {
	return await apiRequest('/dimensi', {
		method: 'GET'
	});
}

export async function getDimensiByBarang(barangId) {
	return await apiRequest(`/dimensi/barang/${barangId}`, {
		method: 'GET'
	});
}

export async function createDimensi(data) {
	return await apiRequest('/dimensi', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateDimensi(id, data) {
	return await apiRequest(`/dimensi/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
}

export async function deleteDimensi(id) {
	return await apiRequest(`/dimensi/${id}`, {
		method: 'DELETE'
	});
}

// ============ BARCODE API CALLS ============
export async function getBarcode() {
	return await apiRequest('/barcode', {
		method: 'GET'
	});
}

export async function getBarcodeByBarang(barangId) {
	return await apiRequest(`/barcode/barang/${barangId}`, {
		method: 'GET'
	});
}

export async function createBarcode(data) {
	return await apiRequest('/barcode', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateBarcode(id, data) {
	return await apiRequest(`/barcode/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
}

export async function deleteBarcode(id) {
	return await apiRequest(`/barcode/${id}`, {
		method: 'DELETE'
	});
}

// ============ HELPER FUNCTIONS ============
// Get complete barang data with relations
export async function getBarangWithDetails(id) {
	const [barang, dimensi, barcode] = await Promise.all([
		getBarangById(id),
		getDimensiByBarang(id),
		getBarcodeByBarang(id)
	]);

	return {
		...barang,
		dimensi,
		barcode
	};
}

// Search barang by kode or nama
export async function searchBarang(query) {
	return await apiRequest(`/barang/search?q=${encodeURIComponent(query)}`, {
		method: 'GET'
	});
}

// Get barang by kategori
export async function getBarangByKategori(kategoriId) {
	return await apiRequest(`/barang/kategori/${kategoriId}`, {
		method: 'GET'
	});
}

// Get barang by departemen
export async function getBarangByDepartemen(departemenId) {
	return await apiRequest(`/barang/departemen/${departemenId}`, {
		method: 'GET'
	});
}

// Get barang by divisi
export async function getBarangByDivisi(divisiId) {
	return await apiRequest(`/barang/divisi/${divisiId}`, {
		method: 'GET'
	});
}
