// src//lib/services/masterItemService.js
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

// ============ DIVISI API CALLS ============
export async function getDivisi() {
	return await apiRequest('/divisi', {
		method: 'GET'
	});
}

export async function createDivisi(data) {
	return await apiRequest('/divisi', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateDivisi(id, data) {
	return await apiRequest(`/divisi/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
}

export async function deleteDivisi(id) {
	return await apiRequest(`/divisi/${id}`, {
		method: 'DELETE'
	});
}

// ============ DEPARTEMEN API CALLS ============
export async function getDepartemen() {
	return await apiRequest('/departemen', {
		method: 'GET'
	});
}

export async function createDepartemen(data) {
	return await apiRequest('/departemen', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateDepartemen(id, data) {
	return await apiRequest(`/departemen/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
}

export async function deleteDepartemen(id) {
	return await apiRequest(`/departemen/${id}`, {
		method: 'DELETE'
	});
}

// ============ KATEGORI API CALLS ============
export async function getKategori() {
	return await apiRequest('/kategori', {
		method: 'GET'
	});
}

export async function createKategori(data) {
	return await apiRequest('/kategori', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateKategori(id, data) {
	return await apiRequest(`/kategori/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data)
	});
}

export async function deleteKategori(id) {
	return await apiRequest(`/kategori/${id}`, {
		method: 'DELETE'
	});
}

// ============ HELPER FUNCTIONS ============
// Get departemen by divisi_id
export async function getDepartemenByDivisi(divisiId) {
	return await apiRequest(`/departemen/divisi/${divisiId}`, {
		method: 'GET'
	});
}

// Get kategori by departemen_id
export async function getKategoriByDepartemen(departemenId) {
	return await apiRequest(`/kategori/departemen/${departemenId}`, {
		method: 'GET'
	});
}