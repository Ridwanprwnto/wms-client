<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { isDarkMode, initializeDarkMode } from '$lib/stores/themeStore.js';

	onMount(async () => {
		// Initialize dark mode first
		initializeDarkMode();

		// Initialize Flowbite
		if (typeof window !== 'undefined') {
			const { initFlowbite } = await import('flowbite');
			initFlowbite();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SvelteKit + Flowbite App</title>
</svelte:head>

<main class="min-h-screen">
	<slot />
</main>
