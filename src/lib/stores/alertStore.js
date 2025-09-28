// src/lib/stores/alertStore.js
import { writable } from 'svelte/store';

// Alert types
export const ALERT_TYPES = {
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info'
};

// Alert store
function createAlertStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,

		// Add alert
		add: (message, type = ALERT_TYPES.INFO, duration = 5000) => {
			const id = Date.now() + Math.random();
			const alert = {
				id,
				message,
				type,
				timestamp: new Date()
			};

			update((alerts) => [...alerts, alert]);

			// Auto remove alert after duration
			if (duration > 0) {
				setTimeout(() => {
					update((alerts) => alerts.filter((a) => a.id !== id));
				}, duration);
			}

			return id;
		},

		// Remove specific alert
		remove: (id) => {
			update((alerts) => alerts.filter((a) => a.id !== id));
		},

		// Clear all alerts
		clear: () => {
			set([]);
		},

		// Convenience methods
		success: (message, duration = 5000) => {
			return createAlertStore().add(message, ALERT_TYPES.SUCCESS, duration);
		},

		error: (message, duration = 7000) => {
			return createAlertStore().add(message, ALERT_TYPES.ERROR, duration);
		},

		warning: (message, duration = 6000) => {
			return createAlertStore().add(message, ALERT_TYPES.WARNING, duration);
		},

		info: (message, duration = 5000) => {
			return createAlertStore().add(message, ALERT_TYPES.INFO, duration);
		}
	};
}

export const alertStore = createAlertStore();
