// src/lib/utils/alertUtils.js
import { alertStore } from '$lib/stores/alertStore.js';

/**
 * Show success alert
 * @param {string} message - Alert message
 * @param {number} duration - Duration in milliseconds (default: 5000)
 * @returns {number} Alert ID
 */
export function showSuccess(message, duration = 5000) {
	return alertStore.add(message, 'success', duration);
}

/**
 * Show error alert
 * @param {string} message - Alert message
 * @param {number} duration - Duration in milliseconds (default: 7000)
 * @returns {number} Alert ID
 */
export function showError(message, duration = 7000) {
	return alertStore.add(message, 'error', duration);
}

/**
 * Show warning alert
 * @param {string} message - Alert message
 * @param {number} duration - Duration in milliseconds (default: 6000)
 * @returns {number} Alert ID
 */
export function showWarning(message, duration = 6000) {
	return alertStore.add(message, 'warning', duration);
}

/**
 * Show info alert
 * @param {string} message - Alert message
 * @param {number} duration - Duration in milliseconds (default: 5000)
 * @returns {number} Alert ID
 */
export function showInfo(message, duration = 5000) {
	return alertStore.add(message, 'info', duration);
}

/**
 * Handle API response and show appropriate alert
 * @param {Object} response - API response object
 * @param {boolean} response.success - Success status
 * @param {string} response.message - Response message
 * @param {string} successMessage - Default success message
 * @param {string} errorMessage - Default error message
 * @returns {number|null} Alert ID or null if no alert shown
 */
export function handleApiResponse(
	response,
	successMessage = 'Operasi berhasil',
	errorMessage = 'Terjadi kesalahan'
) {
	if (!response) {
		return showError('Response tidak valid');
	}

	if (response.success === true) {
		return showSuccess(response.message || successMessage);
	} else if (response.success === false) {
		return showError(response.message || errorMessage);
	}

	// If success property is undefined, check for common patterns
	if (response.error) {
		return showError(response.error);
	}

	if (response.status === 'success') {
		return showSuccess(response.message || successMessage);
	}

	if (response.status === 'error') {
		return showError(response.message || errorMessage);
	}

	return null;
}

/**
 * Handle form errors from SvelteKit
 * @param {Object} form - Form object from page
 * @param {string} form.error - Error message
 * @param {string} form.success - Success message
 * @param {string} form.warning - Warning message
 * @param {string} form.info - Info message
 * @returns {number|null} Alert ID or null if no alert shown
 */
export function handleFormError(form) {
	if (!form) return null;

	let alertId = null;

	if (form.error) {
		alertId = showError(form.error);
	} else if (form.success) {
		alertId = showSuccess(form.success);
	} else if (form.warning) {
		alertId = showWarning(form.warning);
	} else if (form.info) {
		alertId = showInfo(form.info);
	}

	return alertId;
}

/**
 * Handle HTTP fetch errors
 * @param {Response} response - Fetch response object
 * @param {string} defaultMessage - Default error message
 * @returns {number} Alert ID
 */
export function handleFetchError(response, defaultMessage = 'Terjadi kesalahan jaringan') {
	let message = defaultMessage;

	switch (response.status) {
		case 400:
			message = 'Request tidak valid (400)';
			break;
		case 401:
			message = 'Tidak terotorisasi - silakan login kembali (401)';
			break;
		case 403:
			message = 'Akses ditolak (403)';
			break;
		case 404:
			message = 'Data tidak ditemukan (404)';
			break;
		case 422:
			message = 'Data tidak valid (422)';
			break;
		case 500:
			message = 'Kesalahan server internal (500)';
			break;
		case 502:
			message = 'Gateway error - server tidak merespons (502)';
			break;
		case 503:
			message = 'Layanan tidak tersedia (503)';
			break;
		default:
			if (response.status >= 500) {
				message = `Kesalahan server (${response.status})`;
			} else if (response.status >= 400) {
				message = `Request error (${response.status})`;
			}
			break;
	}

	return showError(message);
}

/**
 * Handle network errors (no response)
 * @param {Error} error - Error object
 * @returns {number} Alert ID
 */
export function handleNetworkError(error) {
	let message = 'Terjadi kesalahan jaringan';

	if (error.name === 'TypeError' && error.message.includes('fetch')) {
		message = 'Tidak dapat terhubung ke server - periksa koneksi internet';
	} else if (error.message.includes('timeout')) {
		message = 'Request timeout - server tidak merespons';
	} else if (error.message.includes('abort')) {
		message = 'Request dibatalkan';
	} else if (error.message) {
		message = `Network error: ${error.message}`;
	}

	return showError(message, 8000); // Longer duration for network errors
}

/**
 * Show loading alert (typically used for async operations)
 * @param {string} message - Loading message
 * @param {number} duration - Duration in milliseconds (0 for manual dismiss)
 * @returns {number} Alert ID
 */
export function showLoading(message = 'Memproses...', duration = 0) {
	return showInfo(message, duration);
}

/**
 * Clear all alerts
 */
export function clearAllAlerts() {
	alertStore.clear();
}

/**
 * Remove specific alert by ID
 * @param {number} alertId - Alert ID to remove
 */
export function removeAlert(alertId) {
	alertStore.remove(alertId);
}

/**
 * Show confirmation-style warning (typically for destructive actions)
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds (default: 8000)
 * @returns {number} Alert ID
 */
export function showConfirmationWarning(message, duration = 8000) {
	return showWarning(message, duration);
}

/**
 * Handle validation errors (array of error messages)
 * @param {Array<string>} errors - Array of error messages
 * @param {string} title - Optional title for the error
 * @returns {Array<number>} Array of alert IDs
 */
export function handleValidationErrors(errors, title = 'Validasi gagal') {
	if (!Array.isArray(errors)) {
		return [showError(typeof errors === 'string' ? errors : 'Validasi gagal')];
	}

	const alertIds = [];

	if (errors.length === 1) {
		alertIds.push(showError(errors[0]));
	} else if (errors.length > 1) {
		// Show title first
		alertIds.push(showError(title));

		// Show each error with shorter duration
		errors.forEach((error, index) => {
			setTimeout(
				() => {
					alertIds.push(showError(`${index + 1}. ${error}`, 6000));
				},
				(index + 1) * 500
			); // Stagger the alerts
		});
	}

	return alertIds;
}

/**
 * Show temporary success with auto-hide (for quick feedback)
 * @param {string} message - Success message
 * @returns {number} Alert ID
 */
export function showQuickSuccess(message) {
	return showSuccess(message, 3000);
}

/**
 * Show persistent error (manual dismiss only)
 * @param {string} message - Error message
 * @returns {number} Alert ID
 */
export function showPersistentError(message) {
	return showError(message, 0);
}

/**
 * Batch show multiple alerts with delay
 * @param {Array<{message: string, type: string, delay?: number}>} alerts - Array of alert configs
 */
export function showBatchAlerts(alerts) {
	if (!Array.isArray(alerts)) return;

	alerts.forEach((alert, index) => {
		const delay = alert.delay || index * 1000;

		setTimeout(() => {
			switch (alert.type) {
				case 'success':
					showSuccess(alert.message);
					break;
				case 'error':
					showError(alert.message);
					break;
				case 'warning':
					showWarning(alert.message);
					break;
				case 'info':
				default:
					showInfo(alert.message);
					break;
			}
		}, delay);
	});
}

// Utility object for easier importing
export const alerts = {
	success: showSuccess,
	error: showError,
	warning: showWarning,
	info: showInfo,
	loading: showLoading,
	clear: clearAllAlerts,
	remove: removeAlert,
	handleApi: handleApiResponse,
	handleForm: handleFormError,
	handleFetch: handleFetchError,
	handleNetwork: handleNetworkError,
	handleValidation: handleValidationErrors,
	quick: showQuickSuccess,
	persistent: showPersistentError,
	batch: showBatchAlerts
};
