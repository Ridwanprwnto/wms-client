<script lang="ts">
	import { Card, Heading } from 'flowbite-svelte';
	import { ChevronRightOutline } from 'flowbite-svelte-icons';
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<div class="items-center justify-between lg:flex">
		<div class="mt-px mb-4 lg:mb-0">
			<Heading tag="h3" class="mb-2 -ml-0.25 text-xl font-semibold dark:text-white"
				>Navigation</Heading
			>
			<span class="text-base font-normal text-gray-500 dark:text-gray-300"> Description </span>
		</div>
		<div class="items-center justify-between gap-3 space-y-4 sm:flex sm:space-y-0">
			<div class="flex items-center">
				<span class="text-base font-normal text-gray-500 dark:text-gray-300">Component</span>
			</div>
		</div>
	</div>

	<div class="-mb-1 flex items-center justify-between pt-3 sm:pt-6">
		<a
			href="#top"
			class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-1 text-xs font-medium uppercase hover:bg-gray-100 sm:text-sm dark:hover:bg-gray-700"
		>
			Link <ChevronRightOutline size="lg" />
		</a>
	</div>
</Card>
