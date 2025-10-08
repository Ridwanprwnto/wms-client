<script lang="ts">
	import { Button, Modal } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	// Props
	export let open = false;
	export let title = 'Are you sure?';
	export let message = 'This action cannot be undone.';
	export let confirmText = "Yes, I'm sure";
	export let cancelText = 'No, cancel';
	export let confirmColor: 'red' | 'blue' | 'green' | 'yellow' | 'purple' = 'red';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'xs';
	export let permanent = true;
	export let loading = false;
	export let loadingText = 'Processing...';

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
		close: void;
	}>();

	// Handle confirm action
	function handleConfirm() {
		if (loading) return;
		dispatch('confirm');
	}

	// Handle cancel action
	function handleCancel() {
		if (loading) return;
		open = false;
		dispatch('cancel');
	}

	// Handle modal close
	function handleClose() {
		if (loading) return;
		open = false;
		dispatch('close');
	}
</script>

<Modal bind:open {size} transition={slide} {permanent} onclick={handleClose}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />

		<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
			{title}
		</h3>

		<p class="mb-5 text-sm font-normal text-gray-500 dark:text-gray-400">
			{message}
		</p>

		<div class="flex justify-center space-x-2">
			<Button onclick={handleConfirm} color={confirmColor} disabled={loading} class="cursor-pointer min-w-[100px]">
				{loading ? loadingText : confirmText}
			</Button>

			<Button onclick={handleCancel} color="alternative" disabled={loading} class="cursor-pointer min-w-[100px]">
				{cancelText}
			</Button>
		</div>
	</div>
</Modal>
