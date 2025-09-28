<script lang="ts">
	import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import {
		HomeOutline,
		ChevronDoubleRightOutline,
		ChartPieOutline,
		ShoppingBagOutline,
		UsersOutline,
		ClipboardListOutline,
		CogOutline,
		UserCircleOutline,
		EyeOutline,
		FolderOutline
	} from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	import { generateBreadcrumbs, getIconComponent } from '$lib/utils/breadcrumbUtils.js';

	// Props
	export let customClass = '';
	export let showBackground = true;
	export let customBreadcrumbs = null; // Optional: override automatic generation

	// Icon components mapping
	const iconComponents = {
		HomeOutline,
		ChartPieOutline,
		ShoppingBagOutline,
		UsersOutline,
		ClipboardListOutline,
		CogOutline,
		UserCircleOutline,
		EyeOutline,
		FolderOutline
	};

	// Generate breadcrumbs automatically based on current route
	$: breadcrumbs = customBreadcrumbs || generateBreadcrumbs($page.url.pathname, $page.data);

	// Get icon component
	function getIcon(iconKey) {
		const componentName = getIconComponent(iconKey);
		return iconComponents[componentName] || iconComponents.FolderOutline;
	}

	// Default classes
	$: breadcrumbClass = showBackground
		? `bg-gray-50 px-5 py-3 dark:bg-gray-900 ${customClass}`.trim()
		: customClass;
</script>

{#if breadcrumbs && breadcrumbs.length > 0}
	<Breadcrumb aria-label="Page navigation breadcrumb" class={breadcrumbClass}>
		{#each breadcrumbs as item, index (item.href)}
			<BreadcrumbItem
				href={item.isLast ? undefined : item.href}
				home={item.isHome}
				class={item.isLast ? 'cursor-default' : 'hover:text-blue-600 dark:hover:text-blue-400'}
			>
				{#snippet icon()}
					{#if item.isHome}
						<svelte:component this={getIcon('home')} class="me-2 h-4 w-4" />
					{:else if index > 0}
						<ChevronDoubleRightOutline class="mx-2 h-5 w-5 text-gray-400 dark:text-gray-300" />
					{/if}
				{/snippet}

				<!-- Content -->
				<span class={item.isLast ? 'text-gray-500 dark:text-gray-400' : ''}>
					{item.title}
				</span>
			</BreadcrumbItem>
		{/each}
	</Breadcrumb>
{/if}
