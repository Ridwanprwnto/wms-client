<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AlertContainer from '$lib/components/AlertContainer.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Header from '$lib/layouts/Header.svelte';
	import Sidebar from '$lib/layouts/Sidebar.svelte';
	import { showInfo } from '$lib/utils/alertUtils.js';

	let isSidebarOpen = false;
	let isLargeScreen = false;

	// Check screen size for responsive behavior
	function checkScreenSize() {
		if (typeof window !== 'undefined') {
			isLargeScreen = window.innerWidth >= 1024; // lg breakpoint

			// Auto-close sidebar on mobile when navigating
			if (!isLargeScreen && isSidebarOpen) {
				isSidebarOpen = false;
			}
		}
	}

	// Toggle sidebar with better mobile handling
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
		console.log('Sidebar toggled:', isSidebarOpen); // Debug log

		// Prevent body scroll when sidebar is open on mobile
		if (typeof window !== 'undefined' && !isLargeScreen) {
			if (isSidebarOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	}

	// Close sidebar when clicking outside on mobile
	function closeSidebarOnOutsideClick() {
		if (!isLargeScreen) {
			isSidebarOpen = false;
			document.body.style.overflow = '';
		}
	}

	// Handle route changes - close sidebar on mobile
	$: if ($page.url.pathname && !isLargeScreen) {
		isSidebarOpen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	onMount(() => {
		checkScreenSize();

		// Add resize listener
		window.addEventListener('resize', checkScreenSize);

		// Cleanup body overflow on component destroy
		return () => {
			window.removeEventListener('resize', checkScreenSize);
			if (typeof document !== 'undefined') {
				document.body.style.overflow = '';
			}
		};
	});

	// Debug reactive statement
	$: console.log('isSidebarOpen:', isSidebarOpen, 'isLargeScreen:', isLargeScreen);

	// Debug breadcrumb - hapus setelah testing
	$: console.log('Current pathname for breadcrumb:', $page.url.pathname);
</script>

<svelte:head>
	<title>Dashboard - Warehouse Management System</title>
	<meta name="description" content="Warehouse Management System Dashboard" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<!-- Main container -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
	<!-- Header - Fixed at top -->
	<Header {toggleSidebar} />

	<!-- Backdrop overlay for mobile sidebar -->
	{#if isSidebarOpen && !isLargeScreen}
		<div
			class="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
			on:click={closeSidebarOnOutsideClick}
			on:keydown={(e) => e.key === 'Escape' && closeSidebarOnOutsideClick()}
			role="button"
			tabindex="0"
			aria-label="Close sidebar"
		></div>
	{/if}

	<!-- Sidebar with proper mobile handling -->
	<div class="sidebar-container">
		<Sidebar bind:isSidebarOpen />
	</div>

	<!-- Main content area -->
	<div class="lg:ml-64 transition-all duration-300 ease-in-out">
		<main class="pt-22 min-h-screen">
			<div class="border-b border-gray-200 dark:border-gray-700">
				<Breadcrumb customClass="px-4 py-3 sm:px-6 lg:px-8" />
			</div>

			<div class="p-4 sm:p-6 lg:p-8">
				<slot />
			</div>
		</main>
	</div>

	<!-- Global Alert Container -->
	<AlertContainer />
</div>

<style>
	/* Ensure no style conflicts */
	:global(body) {
		margin: 0;
		padding: 0;
	}

	/* Smooth transitions */
	main {
		transition: margin-left 0.3s ease-in-out;
	}

	/* Sidebar container styling */
	.sidebar-container {
		position: relative;
		z-index: 40;
	}

	/* Mobile sidebar adjustments */
	@media (max-width: 1023px) {
		:global(.sidebar-container .sidebar) {
			transform: translateX(-100%);
			transition: transform 0.3s ease-in-out;
		}

		:global(.sidebar-container .sidebar.open) {
			transform: translateX(0);
		}
	}

	/* Ensure sidebar content is always visible on desktop */
	@media (min-width: 1024px) {
		:global(.sidebar-container .sidebar) {
			transform: translateX(0) !important;
		}
	}

	/* Fix for potential content overflow */
	.min-h-screen {
		min-height: 100vh;
		min-height: 100dvh; /* Dynamic viewport height for mobile */
	}
</style>
