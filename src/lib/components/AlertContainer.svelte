<script>
	import { alertStore, ALERT_TYPES } from '$lib/stores/alertStore.js';
	import { Alert } from 'flowbite-svelte';
	import * as Icon from 'flowbite-svelte-icons';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { CloseOutline } from 'flowbite-svelte-icons';

	// Reactive statement untuk mendapatkan alerts dari store
	$: alerts = $alertStore;

	/**
	 * Get Flowbite alert color based on alert type
	 * @param {string} type - Alert type
	 * @returns {string} Flowbite color
	 */
	function getAlertColor(type) {
		switch (type) {
			case ALERT_TYPES.SUCCESS:
				return 'green';
			case ALERT_TYPES.ERROR:
				return 'red';
			case ALERT_TYPES.WARNING:
				return 'yellow';
			case ALERT_TYPES.INFO:
			default:
				return 'blue';
		}
	}

	/**
	 * Get appropriate icon component for alert type
	 * @param {string} type - Alert type
	 * @returns {Component} Svelte icon component
	 */
	function getAlertIcon(type) {
		switch (type) {
			case ALERT_TYPES.SUCCESS:
				return Icon.CheckCircleOutline;
			case ALERT_TYPES.ERROR:
				return Icon.ExclamationCircleOutline;
			case ALERT_TYPES.WARNING:
				return Icon.ExclamationTriangleOutline;
			case ALERT_TYPES.INFO:
			default:
				return Icon.InformationCircleOutline;
		}
	}

	/**
	 * Get CSS classes for alert styling
	 * @param {string} type - Alert type
	 * @returns {string} CSS classes
	 */
	function getAlertClasses(type) {
		const baseClasses = 'shadow-lg border-l-4 backdrop-blur-sm';

		switch (type) {
			case ALERT_TYPES.SUCCESS:
				return `${baseClasses} border-l-green-500 bg-green-50/95 dark:bg-green-900/95`;
			case ALERT_TYPES.ERROR:
				return `${baseClasses} border-l-red-500 bg-red-50/95 dark:bg-red-900/95`;
			case ALERT_TYPES.WARNING:
				return `${baseClasses} border-l-yellow-500 bg-yellow-50/95 dark:bg-yellow-900/95`;
			case ALERT_TYPES.INFO:
			default:
				return `${baseClasses} border-l-blue-500 bg-blue-50/95 dark:bg-blue-900/95`;
		}
	}

	/**
	 * Remove alert from store
	 * @param {number} id - Alert ID
	 */
	function removeAlert(id) {
		alertStore.remove(id);
	}

	/**
	 * Format timestamp for display
	 * @param {Date} timestamp - Alert timestamp
	 * @returns {string} Formatted time
	 */
	function formatTime(timestamp) {
		return timestamp.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	/**
	 * Get alert priority for z-index stacking
	 * @param {string} type - Alert type
	 * @returns {number} Priority level
	 */
	function getAlertPriority(type) {
		switch (type) {
			case ALERT_TYPES.ERROR:
				return 4;
			case ALERT_TYPES.WARNING:
				return 3;
			case ALERT_TYPES.SUCCESS:
				return 2;
			case ALERT_TYPES.INFO:
			default:
				return 1;
		}
	}

	// Sort alerts by priority (error first, then warning, success, info)
	$: sortedAlerts = [...alerts].sort((a, b) => {
		const priorityA = getAlertPriority(a.type);
		const priorityB = getAlertPriority(b.type);

		if (priorityA !== priorityB) {
			return priorityB - priorityA; // Higher priority first
		}

		// If same priority, sort by timestamp (newest first)
		return b.timestamp.getTime() - a.timestamp.getTime();
	});
</script>

<!-- Alert Container - Fixed position di top-right dengan responsive behavior -->
<div class="alert-container">
	{#each sortedAlerts as alert, index (alert.id)}
		<div
			class="alert-item"
			style="z-index: {50 + index};"
			in:fly={{
				x: 300,
				duration: 400,
				easing: quintOut,
				delay: index * 100
			}}
			out:fly={{
				x: 300,
				duration: 300,
				easing: quintOut
			}}
		>
			<Alert
				color={getAlertColor(alert.type)}
				dismissable={false}
				class={getAlertClasses(alert.type)}
			>
				<svelte:fragment slot="icon">
					<svelte:component this={getAlertIcon(alert.type)} class="w-5 h-5 flex-shrink-0" />
				</svelte:fragment>

				<div class="flex items-start justify-between w-full">
					<div class="flex-1 min-w-0">
						<!-- Alert Message -->
						<div class="text-sm font-medium text-gray-800 dark:text-gray-200 leading-5 mb-1">
							{alert.message}
						</div>

						<!-- Timestamp -->
						<div class="text-xs text-gray-600 dark:text-gray-400 opacity-75">
							{formatTime(alert.timestamp)}
						</div>
					</div>

					<!-- Close Button -->
					<button
						on:click={() => removeAlert(alert.id)}
						class="flex-shrink-0 ml-3 -mr-1 -mt-1 p-1.5 rounded-lg transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400/50"
						aria-label="Dismiss alert"
						title="Tutup notifikasi"
					>
						<CloseOutline
							class="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						/>
					</button>
				</div>
			</Alert>
		</div>
	{/each}
</div>

<style>
	.alert-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 50;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 420px;
		width: 100%;
		max-height: calc(100vh - 2rem);
		overflow-y: auto;
		pointer-events: none; /* Allow clicks to pass through container */
	}

	.alert-item {
		pointer-events: auto; /* Re-enable clicks for alert items */
		min-width: 320px;
		max-width: 420px;
		width: 100%;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.alert-container {
			top: 0.5rem;
			right: 0.5rem;
			left: 0.5rem;
			max-width: none;
		}

		.alert-item {
			min-width: 100%;
			max-width: 100%;
		}
	}

	/* Custom scrollbar for alert container */
	.alert-container::-webkit-scrollbar {
		width: 4px;
	}

	.alert-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.alert-container::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.alert-container::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.3);
	}

	/* Dark mode scrollbar */
	@media (prefers-color-scheme: dark) {
		.alert-container::-webkit-scrollbar-thumb {
			background: rgba(255, 255, 255, 0.2);
		}

		.alert-container::-webkit-scrollbar-thumb:hover {
			background: rgba(255, 255, 255, 0.3);
		}
	}

	/* Animation improvements */
	.alert-item {
		transform-origin: right center;
	}

	/* Ensure alerts stack properly */
	.alert-container > .alert-item:first-child {
		margin-top: 0;
	}

	/* Add subtle shadow for better visibility */
	.alert-item :global(.alert) {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05),
			0 0 0 1px rgba(0, 0, 0, 0.05);
	}

	/* Dark mode shadow adjustment */
	:global(.dark) .alert-item :global(.alert) {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.3),
			0 4px 6px -2px rgba(0, 0, 0, 0.2),
			0 0 0 1px rgba(255, 255, 255, 0.1);
	}
</style>
