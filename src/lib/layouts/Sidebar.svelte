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
		ChevronDownOutline
	} from 'flowbite-svelte-icons';

	import { showInfo } from '$lib/utils/alertUtils.js';

	export let isSidebarOpen;

	// Get current path for active states
	$: currentPath = $page.url.pathname;

	// Direct reactive active states
	$: dashboardActive = currentPath === '/dashboard';
	$: warehouseActive =
		currentPath.startsWith('/inventory') ||
		currentPath.startsWith('/stock-movement') ||
		currentPath.startsWith('/locations');
	$: ordersActive = currentPath.startsWith('/orders');
	$: productsActive = currentPath === '/products';
	$: analyticsActive = currentPath === '/analytics';
	$: usersActive = currentPath.startsWith('/users') || currentPath === '/profile';
	$: settingsActive = currentPath.startsWith('/settings');
	$: helpActive = currentPath === '/help';
	$: supportActive = currentPath === '/support';

	// Individual sub-item active states
	$: inventoryActive = currentPath === '/inventory';
	$: stockMovementActive = currentPath === '/stock-movement';
	$: locationsActive = currentPath === '/locations';
	$: allOrdersActive = currentPath === '/orders';
	$: pendingOrdersActive = currentPath === '/orders/pending';
	$: processingOrdersActive = currentPath === '/orders/processing';
	$: completedOrdersActive = currentPath === '/orders/completed';
	$: allUsersActive = currentPath === '/users';
	$: profileActive = currentPath === '/profile';
	$: rolesActive = currentPath === '/users/roles';
	$: permissionsActive = currentPath === '/users/permissions';
	$: generalSettingsActive = currentPath === '/settings';
	$: securitySettingsActive = currentPath === '/settings/security';
	$: integrationsSettingsActive = currentPath === '/settings/integrations';

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
					class="flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {dashboardActive
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

			<!-- Warehouse Dropdown -->
			<div>
				<button
					type="button"
					class="flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {warehouseActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('Warehouse')}
					aria-expanded={openDropdowns['Warehouse'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<GridOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>Warehouse</span>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['Warehouse']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['Warehouse']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {inventoryActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Inventory', href: '/inventory' }, e)}
						>
							<span class="block text-left">Inventory</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {stockMovementActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Stock Movement', href: '/stock-movement' }, e)}
						>
							<span class="block text-left">Stock Movement</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {locationsActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Locations', href: '/locations' }, e)}
						>
							<span class="block text-left">Locations</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Orders Dropdown -->
			<div>
				<button
					type="button"
					class="flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {ordersActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('Orders')}
					aria-expanded={openDropdowns['Orders'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<ClipboardListOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>Orders</span>
						<Badge color="blue" size="sm" class="ml-2">5</Badge>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['Orders']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['Orders']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {allOrdersActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'All Orders', href: '/orders' }, e)}
						>
							<span class="block text-left">All Orders</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {pendingOrdersActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Pending', href: '/orders/pending' }, e)}
						>
							<span class="block text-left">Pending</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {processingOrdersActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Processing', href: '/orders/processing' }, e)}
						>
							<span class="block text-left">Processing</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {completedOrdersActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Completed', href: '/orders/completed' }, e)}
						>
							<span class="block text-left">Completed</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Products -->
			<div>
				<button
					type="button"
					class="flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {productsActive
						? 'text-white bg-blue-600 hover:bg-blue-700'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={(e) => handleNavClick({ label: 'Products', href: '/products' }, e)}
				>
					<div class="flex-shrink-0 w-5 h-5 mr-3">
						<ShoppingBagOutline class="w-5 h-5 {productsActive ? 'text-white' : 'text-gray-500'}" />
					</div>
					<span class="flex-1 text-left">Products</span>
				</button>
			</div>

			<!-- Analytics -->
			<div>
				<button
					type="button"
					class="flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {analyticsActive
						? 'text-white bg-blue-600 hover:bg-blue-700'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={(e) => handleNavClick({ label: 'Analytics', href: '/analytics' }, e)}
				>
					<div class="flex-shrink-0 w-5 h-5 mr-3">
						<FileChartBarOutline
							class="w-5 h-5 {analyticsActive ? 'text-white' : 'text-gray-500'}"
						/>
					</div>
					<span class="flex-1 text-left">Analytics</span>
				</button>
			</div>

			<!-- Users Dropdown -->
			<div>
				<button
					type="button"
					class="flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {usersActive
						? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={() => toggleDropdown('Users')}
					aria-expanded={openDropdowns['Users'] ? 'true' : 'false'}
				>
					<div class="flex items-center">
						<div class="flex-shrink-0 w-5 h-5 mr-3">
							<UsersGroupOutline class="w-5 h-5 text-gray-500" />
						</div>
						<span>Users</span>
					</div>
					<ChevronDownOutline
						class="w-4 h-4 transition-transform duration-200 {openDropdowns['Users']
							? 'rotate-180'
							: ''}"
					/>
				</button>

				{#if openDropdowns['Users']}
					<div class="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {allUsersActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'All Users', href: '/users' }, e)}
						>
							<span class="block text-left">All Users</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {profileActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Profile', href: '/profile' }, e)}
						>
							<span class="block text-left">Profile</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {rolesActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Roles', href: '/users/roles' }, e)}
						>
							<span class="block text-left">Roles</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {permissionsActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Permissions', href: '/users/permissions' }, e)}
						>
							<span class="block text-left">Permissions</span>
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

			<!-- Settings Dropdown -->
			<div>
				<button
					type="button"
					class="flex items-center justify-between p-3 w-full text-base font-normal rounded-lg transition-colors duration-200 {settingsActive
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
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {generalSettingsActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'General', href: '/settings' }, e)}
						>
							<span class="block text-left">General</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {securitySettingsActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) => handleNavClick({ label: 'Security', href: '/settings/security' }, e)}
						>
							<span class="block text-left">Security</span>
						</button>
						<button
							type="button"
							class="block w-full px-4 py-2 text-sm text-left transition-colors duration-200 rounded-md {integrationsSettingsActive
								? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}"
							on:click={(e) =>
								handleNavClick({ label: 'Integrations', href: '/settings/integrations' }, e)}
						>
							<span class="block text-left">Integrations</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Help Center -->
			<div>
				<button
					type="button"
					class="flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {helpActive
						? 'text-white bg-blue-600 hover:bg-blue-700'
						: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
					on:click={(e) => handleNavClick({ label: 'Help Center', href: '/help' }, e)}
				>
					<div class="flex-shrink-0 w-5 h-5 mr-3">
						<QuestionCircleOutline class="w-5 h-5 {helpActive ? 'text-white' : 'text-gray-500'}" />
					</div>
					<span class="flex-1 text-left">Help Center</span>
				</button>
			</div>

			<!-- Report Issue -->
			<div>
				<button
					type="button"
					class="flex items-center p-3 text-base font-normal w-full rounded-lg transition-colors duration-200 {supportActive
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
					<p>&copy; {new Date().getFullYear()} Purwanto Ridwan</p>
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
