// src/lib/config/apiConfig.js
import { dev } from '$app/environment';
import {
	API_LOCAL_IMS_URL,
	API_LOCAL_WHS_URL,
	API_LOCAL_DPD_URL,
	API_GATEWAY_URL,
	ENDPOINT_IMS,
	ENDPOINT_WHS,
	ENDPOINT_DPD
} from '$env/static/private';

/**
 * Konfigurasi API berdasarkan environment
 */
const apiConfig = {
	// Development: gunakan URL terpisah untuk setiap service
	development: {
		IMS: {
			baseUrl: API_LOCAL_IMS_URL,
			endpoint: ENDPOINT_IMS,
			fullUrl: `${API_LOCAL_IMS_URL}${ENDPOINT_IMS}`
		},
		WHS: {
			baseUrl: API_LOCAL_WHS_URL,
			endpoint: ENDPOINT_WHS,
			fullUrl: `${API_LOCAL_WHS_URL}${ENDPOINT_WHS}`
		},
		DPD: {
			baseUrl: API_LOCAL_DPD_URL,
			endpoint: ENDPOINT_DPD,
			fullUrl: `${API_LOCAL_DPD_URL}${ENDPOINT_DPD}`
		}
	},
	// Production: gunakan API Gateway untuk semua service
	production: {
		IMS: {
			baseUrl: API_GATEWAY_URL,
			endpoint: ENDPOINT_IMS,
			fullUrl: `${API_GATEWAY_URL}${ENDPOINT_IMS}`
		},
		WHS: {
			baseUrl: API_GATEWAY_URL,
			endpoint: ENDPOINT_WHS,
			fullUrl: `${API_GATEWAY_URL}${ENDPOINT_WHS}`
		},
		DPD: {
			baseUrl: API_GATEWAY_URL,
			endpoint: ENDPOINT_DPD,
			fullUrl: `${API_GATEWAY_URL}${ENDPOINT_DPD}`
		}
	}
};

// Pilih konfigurasi berdasarkan environment
const currentConfig = dev ? apiConfig.development : apiConfig.production;

/**
 * Mendapatkan URL lengkap untuk service tertentu
 * @param {'IMS' | 'WHS' | 'DPD'} service - Nama service
 * @returns {string} URL lengkap service
 */
export function getApiUrl(service) {
	if (!currentConfig[service]) {
		throw new Error(`Service "${service}" tidak ditemukan dalam konfigurasi API`);
	}
	return currentConfig[service].fullUrl;
}

/**
 * Mendapatkan base URL untuk service tertentu
 * @param {'IMS' | 'WHS' | 'DPD'} service - Nama service
 * @returns {string} Base URL service
 */
export function getBaseUrl(service) {
	if (!currentConfig[service]) {
		throw new Error(`Service "${service}" tidak ditemukan dalam konfigurasi API`);
	}
	return currentConfig[service].baseUrl;
}

/**
 * Mendapatkan endpoint path untuk service tertentu
 * @param {'IMS' | 'WHS' | 'DPD'} service - Nama service
 * @returns {string} Endpoint path
 */
export function getEndpoint(service) {
	if (!currentConfig[service]) {
		throw new Error(`Service "${service}" tidak ditemukan dalam konfigurasi API`);
	}
	return currentConfig[service].endpoint;
}

/**
 * Membuat URL lengkap dengan path tambahan
 * @param {'IMS' | 'WHS' | 'DPD'} service - Nama service
 * @param {string} path - Path tambahan (misal: '/users/login')
 * @returns {string} URL lengkap dengan path
 */
export function buildApiUrl(service, path = '') {
	const baseUrl = getApiUrl(service);
	// Pastikan tidak ada double slash
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return `${baseUrl}${cleanPath}`;
}

/**
 * Log konfigurasi API yang sedang digunakan (untuk debugging)
 */
export function logApiConfig() {
	console.log('API Configuration:');
	console.log(`Environment: ${dev ? 'Development' : 'Production'}`);
	console.log('Services URLs:');
	Object.keys(currentConfig).forEach((service) => {
		console.log(`  ${service}: ${currentConfig[service].fullUrl}`);
	});
}

// Export untuk akses langsung ke konfigurasi saat ini
export const API_CONFIG = currentConfig;
export const IS_DEVELOPMENT = dev;
