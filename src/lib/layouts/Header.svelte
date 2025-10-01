<script lang="ts">
	import {
		Navbar,
		NavBrand,
		Avatar,
		Dropdown,
		DropdownHeader,
		DropdownGroup,
		DropdownItem,
		DropdownDivider,
		Search,
		Button
	} from 'flowbite-svelte';
	import {
		BarsOutline,
		ArrowRightToBracketOutline,
		CogOutline,
		UserCircleOutline,
		SunOutline,
		MoonOutline
	} from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import { showWarning, showSuccess, showError, showInfo } from '$lib/utils/alertUtils.js';
	import { isDarkMode, toggleDarkMode } from '$lib/stores/themeStore.js';
	import favicon from '$lib/assets/favicon.svg';

	export let toggleSidebar: () => void;

	// Handle dark mode toggle
	function handleDarkModeToggle() {
		toggleDarkMode();
	}

	let searchQuery = '';
	let showLogoutModal = false;
	let isLoggingOut = false;

	// Get user info from page data (passed from layout.server.js)
	$: userData = $page.data?.user;

	// Default user info jika tidak ada data dari server
	const defaultUser = {
		name: 'Administrator',
		email: 'administrator@example.com',
		username: 'admin'
	};

	// Use server data or fallback to default
	$: currentUser = userData || defaultUser;
	$: displayName = currentUser.name || currentUser.username || 'User';
	$: displayEmail = currentUser.email || 'user@example.com';

	// Handle search
	function handleSearch(event: KeyboardEvent) {
		if (event.key === 'Enter' && searchQuery.trim()) {
			showSuccess(`Searching for: "${searchQuery}"`);
		}
	}

	// Handle logout click - show confirmation modal and close dropdown
	function handleLogoutClick() {
		// Close dropdown by clicking avatar again
		const avatarElement = document.getElementById('avatar-menu');
		if (avatarElement) {
			avatarElement.click();
		}
		showLogoutModal = true;
	}

	// Handle logout confirmation from modal
	function handleLogoutConfirm() {
		if (isLoggingOut) return;

		isLoggingOut = true;
		showSuccess('Logging out...');

		// Simulate async logout process
		setTimeout(() => {
			try {
				window.location.href = '/logout';
			} catch (error) {
				console.error('Logout redirect error:', error);
				showError('Logout failed, please try again');
				isLoggingOut = false;
			}
		}, 500);
	}

	// Handle logout cancel from modal
	function handleLogoutCancel() {
		showLogoutModal = false;
	}
</script>

<Navbar
	fluid={true}
	class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
>
	<div class="px-3 py-3 lg:px-5 lg:pl-3 w-full">
		<div class="flex items-center justify-between w-full">
			<!-- Left section: Mobile menu + Brand + Search -->
			<div class="flex items-center flex-1 space-x-4">
				<!-- Mobile menu button -->
				<button
					on:click={toggleSidebar}
					class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 transition-colors"
					aria-label="Toggle sidebar"
				>
					<BarsOutline class="w-6 h-6" />
				</button>

				<!-- Brand -->
				<NavBrand href="/dashboard" class="flex items-center">
					<img src={favicon} class="me-3 h-6 sm:h-9" alt="WMS Logo" />
					<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
						G113 - WMS
					</span>
				</NavBrand>

				<!-- Search bar -->
				<div class="hidden md:flex flex-1 max-w-md ml-15">
					<Search
						bind:value={searchQuery}
						on:keydown={handleSearch}
						size="md"
						placeholder="Search users, products, orders..."
						class="w-full"
					/>
				</div>
			</div>

			<!-- Right section: Welcome message + Actions + Avatar -->
			<div class="flex items-center space-x-4">
				<!-- Welcome message -->
				<div class="hidden lg:flex items-center">
					<div class="text-right mr-3">
						<p class="text-sm font-medium text-gray-900 dark:text-white">Welcome back,</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
							{displayName}
						</p>
					</div>
				</div>

				<!-- Action buttons -->
				<div class="flex items-center space-x-2">
					<!-- Custom Dark Mode Toggle Button -->
					<Button
						onclick={handleDarkModeToggle}
						color="alternative"
						size="md"
						class="cursor-pointer !p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg border-0"
						aria-label="Toggle dark mode"
					>
						{#if $isDarkMode}
							<SunOutline class="w-5 h-5" />
						{:else}
							<MoonOutline class="w-5 h-5" />
						{/if}
					</Button>
				</div>

				<!-- User Avatar -->
				<Avatar
					id="avatar-menu"
					src={favicon}
					class="cursor-pointer ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
					size="sm"
				/>

				<!-- User Dropdown -->
				<Dropdown placement="bottom-end" triggeredBy="#avatar-menu" class="w-64 shadow-lg">
					<DropdownHeader>
						<div class="flex items-center space-x-3">
							<Avatar src={favicon} size="md" class="ring-2 ring-white dark:ring-gray-600" />
							<div class="flex-1 min-w-0">
								<p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
									{displayName}
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
									{displayEmail}
								</p>
								{#if currentUser.username && currentUser.username !== displayName}
									<p class="text-xs text-gray-400 dark:text-gray-500 truncate">
										@{currentUser.username}
									</p>
								{/if}
							</div>
						</div>
					</DropdownHeader>

					<DropdownGroup>
						<!-- Solusi Sederhana: Gunakan href untuk navigation -->
						<DropdownItem
							href="/profile"
							class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
						>
							<UserCircleOutline class="w-4 h-4 mr-3 text-gray-400" />
							<span>Profile</span>
						</DropdownItem>

						<DropdownItem
							href="/products"
							class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
						>
							<CogOutline class="w-4 h-4 mr-3 text-gray-400" />
							<span>Settings</span>
						</DropdownItem>

						<DropdownDivider />

						<!-- Untuk logout tetap gunakan click handler karena perlu konfirmasi -->
						<DropdownItem class="p-0 cursor-pointer">
							<div
								role="button"
								tabindex="0"
								on:click|preventDefault|stopPropagation={handleLogoutClick}
								on:keydown={(e) => e.key === 'Enter' && handleLogoutClick()}
								class="w-full flex items-center px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 cursor-pointer"
							>
								<ArrowRightToBracketOutline class="w-4 h-4 mr-3" />
								<span>Sign Out</span>
							</div>
						</DropdownItem>
					</DropdownGroup>
				</Dropdown>
			</div>
		</div>
	</div>
</Navbar>

<!-- Logout Confirmation Modal using Reusable Component -->
<ConfirmationModal
	bind:open={showLogoutModal}
	title="Sign Out Confirmation"
	message="Are you sure you want to sign out from your account? You will be redirected to the login page."
	confirmText="Yes, sign out"
	cancelText="Cancel"
	confirmColor="red"
	loading={isLoggingOut}
	loadingText="Signing out..."
	size="xs"
	permanent={true}
	on:confirm={handleLogoutConfirm}
	on:cancel={handleLogoutCancel}
/>

<style>
	/* Additional styles if needed */
</style>
