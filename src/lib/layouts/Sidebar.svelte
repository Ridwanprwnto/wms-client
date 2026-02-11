<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Badge } from 'flowbite-svelte';

	// Import semua icons secara eksplisit
	import {
		ChartPieOutline,
		GridOutline,
		ShoppingBagOutline,
		ClipboardListOutline,
		FileChartBarOutline,
		UsersGroupOutline,
		CogOutline,
		QuestionCircleOutline,
		ExclamationCircleOutline,
		ChevronDownOutline,
		PaperClipOutline,
	} from 'flowbite-svelte-icons';

	import { showInfo } from '$lib/utils/alertUtils.js';

	export let isSidebarOpen;

	// Get current path for active states
	$: currentPath = $page.url.pathname;

	// Direct reactive active states
	$: dashboardActive = currentPath === '/dashboard';
	$: settingsActive = currentPath.startsWith('/settings');
	$: atkActive = currentPath.startsWith('/atk');
	$: supportActive = currentPath === '/support';

	$: WSDCActive = currentPath.startsWith('/webservice-dc');
	$: WSDPDActive = currentPath.startsWith('/webservice-dpd');

	// Individual sub-item active states
	$: allSettingsActive = currentPath === '/settings';
	$: MasterCategoryActive = currentPath === '/settings/master-category';
	$: MasterItemActive = currentPath === '/settings/master-item';

	$: allATKActive = currentPath === '/atk';
	$: PlanogramMasterActive = currentPath === '/atk/planogram-master';
	$: PlanogramPlacementActive = currentPath === '/atk/planogram-placement';
	$: PlanogramMappingActive = currentPath === '/atk/planogram-mapping';

	$: allWSDCActive = currentPath === '/web-service-dc';
	$: GrupPertemananActive = currentPath === '/webservice-dc/grup-pertemanan';
	$: MutasiItemPlanogramActive = currentPath === '/webservice-dc/mutasi-item-planogram';

	$: allWSDPDActive = currentPath === '/web-service-dpd';
	$: BookingOrdersActive = currentPath === '/webservice-dpd/booking-pb';
	
	// Track which dropdowns are open
	let openDropdowns = {};

	// Handle navigation click
	async function handleNavClick(item, event) {
		if (event) {
			event.preventDefault();
		}

		if (item.href) {
			try {
				await goto(item.href);
			} catch (error) {
				console.error('Navigation error:', error);
				window.location.href = item.href;
			}
		}
	}

	// Toggle dropdown
	function toggleDropdown(label) {
		openDropdowns[label] = !openDropdowns[label];
		openDropdowns = { ...openDropdowns };
	}

	// Get sidebar classes
	$: sidebarClasses = `
		fixed top-0 left-0 z-40 w-64 h-screen pt-14 
		bg-white border-r border-gray-200 
		dark:bg-gray-800 dark:border-gray-700
		transition-transform duration-300 ease-in-out
		${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
	`.trim();
</script>

<aside class={sidebarClasses} aria-label="Sidebar Navigation">
	<div class="h-full px-3 pt-12 pb-4 overflow-y-auto">
		<!-- Main navigation -->
		<nav class="space-y-2 mb-6">
			<p
				class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
			>
				Main Menu
			</p>

			<!-- Dashboard -->
			<div>
				<button
					type="button"
					class="cursor-pointer flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {dashboardActive
						? 'text-white bg-blue-600 hover:bg-blue-700'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={(e) => handleNavClick({ label: 'Dashboard', href: '/dashboard' }, e)}
				>
					<div class="flex-shrink-0 w-5 h-5 mr-3">
						<ChartPieOutline class="w-5 h-5 {dashboardActive ? 'text-white' : 'text-gray-500'}" />
					</div>
					<span class="flex-1 text-left">Dashboard</span>
				</button>
			</div>

			<!-- Settings Dropdown -->
			<div>
				<button
					type="button"
					class="cursor-pointer flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {settingsActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('Settings')}
					aria-expanded={openDropdowns['Settings'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<CogOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>Settings</span>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['Settings']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['Settings']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<!-- <button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {allSettingsActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'All Settings', href: '/settings' }, e)}
						>
							<span class="block text-left">All Settings</span>
						</button> -->
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {MasterCategoryActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Master Category', href: '/settings/master-category' }, e)}
						>
							<span class="block text-left">Master Category</span>
							<Badge color="blue" size="sm">Beta</Badge>
						</button>
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {MasterItemActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Master Item', href: '/settings/master-item' }, e)}
						>
							<span class="block text-left">Master Items</span>
							<Badge color="blue" size="sm">Beta</Badge>
						</button>
					</div>
				{/if}
			</div>

			<!-- ATK Dropdown -->
			<div>
				<button
					type="button"
					class="cursor-pointer flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {atkActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('ATK')}
					aria-expanded={openDropdowns['ATK'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<PaperClipOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>ATK</span>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['ATK']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['ATK']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<!-- <button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {allATKActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'All ATK', href: '/atk' }, e)}
						>
							<span class="block text-left">All ATK</span>
						</button> -->
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {PlanogramMasterActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Planogram Master', href: '/atk/planogram-master' }, e)}
						>
							<span class="block text-left">Planogram Master</span>
							<Badge color="purple" size="sm">Soon</Badge>
						</button>
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {PlanogramPlacementActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick(
									{ label: 'Planogram Placement', href: '/atk/planogram-placement' },
									e
								)}
						>
							<span class="block text-left">Planogram Placement</span>
							<Badge color="purple" size="sm">Soon</Badge>
						</button>
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {PlanogramMappingActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Planogram Mapping', href: '/atk/planogram-mapping' }, e)}
						>
							<span class="block text-left">Planogram Mapping</span>
							<Badge color="blue" size="sm">Beta</Badge>
						</button>
					</div>
				{/if}
			</div>
		</nav>
		
		<!-- Divider -->
		<hr class="my-4 border-gray-200 dark:border-gray-700" />

		<!-- External Service section -->
		<nav class="space-y-2">
			<p
				class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
			>
				External Services
			</p>

			<!-- Web Service DC Dropdown -->
			<div>
				<button
					type="button"
					class="cursor-pointer flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {WSDCActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('WSDC')}
					aria-expanded={openDropdowns['WSDC'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<GridOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>Webservices DC</span>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['WSDC']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['WSDC']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<!-- <button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {allWSDCActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'All Webservice DC', href: '/webservice-dc' }, e)}
						>
							<span class="block text-left">All Webservice DC</span>
						</button> -->
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {GrupPertemananActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Grup Pertemanan', href: '/webservice-dc/grup-pertemanan' }, e)}
						>
							<span class="block text-left">Grup Pertemanan Tablok</span>
						</button>
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {MutasiItemPlanogramActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Mutasi Item Planogram', href: '/webservice-dc/mutasi-item-planogram' }, e)}
						>
							<span class="block text-left">Mutasi Item Planogram</span>
							<Badge color="purple" size="sm">Soon</Badge>
						</button>
					</div>
				{/if}
			</div>

			<!-- Web Service DPD Dropdown -->
			<div>
				<button
					type="button"
					class="cursor-pointer flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {WSDPDActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('WSDPD')}
					aria-expanded={openDropdowns['WSDPD'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<GridOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>Webservices DPD</span>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['WSDPD']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['WSDPD']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<!-- <button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {allWSDPDActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'All Webservice DPD', href: '/webservice-dpd' }, e)}
						>
							<span class="block text-left">All Webservice DPD</span>
						</button> -->
						<button
							type="button"
							class="cursor-pointer block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {BookingOrdersActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Booking PB Toko', href: '/webservice-dpd/booking-pb' }, e)}
						>
							<span class="block text-left">Booking PB Toko</span>
						</button>
					</div>
				{/if}
			</div>

		</nav>

		<!-- Divider -->
		<hr class="my-4 border-gray-200 dark:border-gray-700" />

		<!-- Settings section -->
		<nav class="space-y-2">
			<p
				class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
			>
				Settings
			</p>

			<div>
				<button
					type="button"
					class="cursor-pointer flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {supportActive
						? 'text-white bg-blue-600 hover:bg-blue-700'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={(e) => handleNavClick({ label: 'Report Issue', href: '/support' }, e)}
				>
					<div class="flex-shrink-0 w-5 h-5 mr-3">
						<ExclamationCircleOutline
							class="w-5 h-5 {supportActive ? 'text-white' : 'text-gray-500'}"
						/>
					</div>
					<span class="flex-1 text-left">Report Issue</span>
					<Badge color="green" size="sm">New</Badge>
				</button>
			</div>
		</nav>

		<!-- Footer -->
		<div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
			<div class="px-3 py-2">
				<div class="text-xs text-gray-500 dark:text-gray-400 text-center">
					<p class="mb-1">WMS Dashboard v1.0.0</p>
					<p>
						&copy; {new Date().getFullYear()}
						<a
							href="https://ridwanpurwanto-blog.vercel.app"
							target="_blank"
							class="text-primary-700 dark:text-primary-500 inline-flex">Purwanto Ridwan</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</aside>

<style>
	/* Explicit colors with !important untuk memastikan override */
	.bg-blue-600 {
		background-color: #2563eb !important;
		color: white !important;
	}

	.bg-blue-600:hover {
		background-color: #1d4ed8 !important;
	}

	.bg-blue-100 {
		background-color: #dbeafe !important;
		color: #1d4ed8 !important;
	}

	.dark .bg-blue-800 {
		background-color: #1e40af !important;
		color: #93c5fd !important;
	}

	/* Mobile responsive */
	@media (max-width: 1023px) {
		aside {
			box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
			z-index: 50 !important;
		}
	}

	/* Button styling */
	button {
		transition: all 0.2s ease-in-out;
		width: 100%;
		text-align: left;
	}

	button:hover {
		transform: translateX(2px);
	}

	button span {
		text-align: left;
	}
</style>
