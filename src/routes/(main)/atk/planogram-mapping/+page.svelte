<script>
	import { Card, Heading, Button, Input } from 'flowbite-svelte';
	import { PlusOutline, TrashBinOutline } from 'flowbite-svelte-icons';

	// Data
	let sourceRacks = [
		{
			id: 1,
			address: 'AA-01-1-1',
			productCode: '10001234',
			product: 'Minyak Goreng',
			cartonPerPallet: 24,
			ipAddress: '172.31.31.1',
			deviceId: '1',
			moved: false
		},
		{
			id: 2,
			address: 'AA-02-1-1',
			productCode: '10001235',
			product: 'Gula Pasir',
			cartonPerPallet: 30,
			ipAddress: '172.31.31.1',
			deviceId: '2',
			moved: false
		},
		{
			id: 3,
			address: 'AA-03-1-1',
			productCode: '10001236',
			product: 'Beras Premium',
			cartonPerPallet: 20,
			ipAddress: '172.31.31.1',
			deviceId: '3',
			moved: false
		},
		{
			id: 4,
			address: 'AB-01-1-1',
			productCode: '10001237',
			product: 'Susu UHT',
			cartonPerPallet: 48,
			ipAddress: '172.31.31.2',
			deviceId: '4',
			moved: false
		},
		{
			id: 5,
			address: 'AB-02-1-1',
			productCode: '10001238',
			product: 'Teh Kotak',
			cartonPerPallet: 36,
			ipAddress: '172.31.31.2',
			deviceId: '5',
			moved: false
		},
		{
			id: 6,
			address: 'BA-01-1-1',
			productCode: '10001239',
			product: 'Kopi Instan',
			cartonPerPallet: 40,
			ipAddress: '172.31.31.3',
			deviceId: '6',
			moved: false
		},
		{
			id: 7,
			address: 'BA-02-1-1',
			productCode: '10001240',
			product: 'Sirup ABC',
			cartonPerPallet: 24,
			ipAddress: '172.31.31.3',
			deviceId: '7',
			moved: false
		}
	];

	let targetRacks = [
		{
			id: 101,
			address: 'CA-01-1-1',
			productCode: '',
			product: null,
			cartonPerPallet: 0,
			ipAddress: '',
			deviceId: '',
			sourceId: null
		},
		{
			id: 102,
			address: 'CA-02-1-1',
			productCode: '',
			product: null,
			cartonPerPallet: 0,
			ipAddress: '',
			deviceId: '',
			sourceId: null
		},
		{
			id: 103,
			address: 'CA-03-1-1',
			productCode: '',
			product: null,
			cartonPerPallet: 0,
			ipAddress: '',
			deviceId: '',
			sourceId: null
		},
		{
			id: 104,
			address: 'CB-01-1-1',
			productCode: '',
			product: null,
			cartonPerPallet: 0,
			ipAddress: '',
			deviceId: '',
			sourceId: null
		},
		{
			id: 105,
			address: 'DA-01-1-1',
			productCode: '',
			product: null,
			cartonPerPallet: 0,
			ipAddress: '',
			deviceId: '',
			sourceId: null
		}
	];

	let draggedItem = null;
	let selectedSourceGroups = [];
	let selectedTargetGroups = [];
	let searchSourceQuery = '';
	let searchTargetQuery = '';

	// Computed - Extract 2 digit LINE code (AA, AB, BA, CA, etc)
	$: sourceGroups = sourceRacks.reduce((g, r) => {
		const k = r.address.substring(0, 2);
		if (!g[k]) g[k] = [];
		g[k].push(r.address);
		return g;
	}, {});

	$: targetGroups = targetRacks.reduce((g, r) => {
		const k = r.address.substring(0, 2);
		if (!g[k]) g[k] = [];
		g[k].push(r.address);
		return g;
	}, {});

	$: filteredSource = selectedSourceGroups.length
		? sourceRacks.filter((r) => {
				const matchesGroup = selectedSourceGroups.includes(r.address.substring(0, 2));
				const matchesSearch =
					searchSourceQuery === '' ||
					r.address.toLowerCase().includes(searchSourceQuery.toLowerCase()) ||
					r.productCode.toLowerCase().includes(searchSourceQuery.toLowerCase()) ||
					r.product.toLowerCase().includes(searchSourceQuery.toLowerCase());
				return matchesGroup && matchesSearch;
			})
		: [];

	$: filteredTarget = selectedTargetGroups.length
		? targetRacks.filter((r) => {
				const matchesGroup = selectedTargetGroups.includes(r.address.substring(0, 2));
				const matchesSearch =
					searchTargetQuery === '' ||
					r.address.toLowerCase().includes(searchTargetQuery.toLowerCase()) ||
					(r.productCode &&
						r.productCode.toLowerCase().includes(searchTargetQuery.toLowerCase())) ||
					(r.product && r.product.toLowerCase().includes(searchTargetQuery.toLowerCase()));
				return matchesGroup && matchesSearch;
			})
		: [];

	$: mappingData = targetRacks
		.filter((t) => t.product)
		.map((t) => {
			const s = sourceRacks.find((x) => x.id === t.sourceId);
			return {
				sourceAddress: s?.address || '-',
				sourceProductCode: s?.productCode || '-',
				targetAddress: t.address,
				targetProductCode: t.productCode,
				product: t.product,
				cartonPerPallet: t.cartonPerPallet,
				ipAddress: t.ipAddress,
				deviceId: t.deviceId
			};
		});

	// Handlers
	function handleSourceGroupChange(e) {
		selectedSourceGroups = Array.from(e.target.selectedOptions, (o) => o.value);
	}

	function handleTargetGroupChange(e) {
		selectedTargetGroups = Array.from(e.target.selectedOptions, (o) => o.value);
	}

	function handleDragStart(item, source) {
		draggedItem = { ...item, source };
	}

	function handleDrop(targetItem) {
		if (!draggedItem) return;

		if (draggedItem.source === 'source') {
			if (targetItem.sourceId) {
				sourceRacks = sourceRacks.map((r) =>
					r.id === targetItem.sourceId ? { ...r, moved: false } : r
				);
			}
			targetRacks = targetRacks.map((r) =>
				r.id === targetItem.id
					? {
							...r,
							productCode: draggedItem.productCode,
							product: draggedItem.product,
							cartonPerPallet: draggedItem.cartonPerPallet,
							ipAddress: draggedItem.ipAddress,
							deviceId: draggedItem.deviceId,
							sourceId: draggedItem.id
						}
					: r
			);
			sourceRacks = sourceRacks.map((r) => {
				if (targetItem.sourceId && r.id === targetItem.sourceId) return { ...r, moved: false };
				if (r.id === draggedItem.id) return { ...r, moved: true };
				return r;
			});
		}

		if (draggedItem.source === 'target' && draggedItem.product) {
			targetRacks = targetRacks.map((r) => {
				if (r.id === targetItem.id)
					return {
						...r,
						productCode: draggedItem.productCode,
						product: draggedItem.product,
						cartonPerPallet: draggedItem.cartonPerPallet,
						ipAddress: draggedItem.ipAddress,
						deviceId: draggedItem.deviceId,
						sourceId: draggedItem.sourceId
					};
				if (r.id === draggedItem.id)
					return {
						...r,
						productCode: targetItem.productCode,
						product: targetItem.product,
						cartonPerPallet: targetItem.cartonPerPallet,
						ipAddress: targetItem.ipAddress,
						deviceId: targetItem.deviceId,
						sourceId: targetItem.sourceId
					};
				return r;
			});
		}
		draggedItem = null;
	}

	function clearTarget(id) {
		const t = targetRacks.find((r) => r.id === id);
		if (t?.sourceId)
			sourceRacks = sourceRacks.map((r) => (r.id === t.sourceId ? { ...r, moved: false } : r));
		targetRacks = targetRacks.map((r) =>
			r.id === id
				? {
						...r,
						productCode: '',
						product: null,
						cartonPerPallet: 0,
						ipAddress: '',
						deviceId: '',
						sourceId: null
					}
				: r
		);
	}

	function clearAll() {
		sourceRacks = sourceRacks.map((r) => ({ ...r, moved: false }));
		targetRacks = targetRacks.map((r) => ({
			...r,
			productCode: '',
			product: null,
			cartonPerPallet: 0,
			ipAddress: '',
			deviceId: '',
			sourceId: null
		}));
	}

	function updateTarget(id, field, val) {
		targetRacks = targetRacks.map((r) => (r.id === id ? { ...r, [field]: val } : r));
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
	<!-- Source -->
	<Card size="xl" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col">
		<h2 class="text-xl font-semibold mb-4 dark:text-white">Origin Rack</h2>
		<div class="mb-4">
			<label class="block text-sm font-semibold mb-2 dark:text-gray-300"
				>Select Line (Ctrl + Click)</label
			>
			<select
				multiple
				on:change={handleSourceGroupChange}
				class="cursor-pointer w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-sm bg-blue-50 dark:bg-gray-700 dark:text-white"
				style="min-height:40px"
			>
				{#each Object.keys(sourceGroups).sort() as g}
					<option value={g}>Line {g} ({sourceGroups[g].length})</option>
				{/each}
			</select>
			{#if selectedSourceGroups.length}
				<div class="mt-2 flex gap-2 flex-wrap">
					{#each selectedSourceGroups as g}
						<span class="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Line {g}</span>
					{/each}
				</div>
			{/if}
		</div>

		{#if selectedSourceGroups.length}
			<div class="mb-3">
				<div class="relative">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<svg
							class="w-4 h-4 text-gray-500 dark:text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path>
						</svg>
					</div>
					<input
						type="text"
						bind:value={searchSourceQuery}
						placeholder="Search by address, product code, or name..."
						class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
					/>
				</div>
			</div>
		{/if}

		{#if filteredSource.length}
			<div class="overflow-auto flex-1">
				<table class="w-full text-sm">
					<thead class="sticky top-0 bg-blue-50 dark:bg-gray-700 z-10">
						<tr>
							<th class="px-2 py-2 text-left dark:text-gray-300">Address</th>
							<th class="px-2 py-2 text-left dark:text-gray-300">Product Code</th>
							<th class="px-2 py-2 text-left dark:text-gray-300">Description</th>
							<th class="px-2 py-2 dark:text-gray-300">Ctn Capacity in Plt</th>
							<th class="px-2 py-2 dark:text-gray-300">Gateway DPD</th>
							<th class="px-2 py-2 dark:text-gray-300">ID DPD</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredSource as r}
							<tr
								draggable={!r.moved}
								on:dragstart={() => !r.moved && handleDragStart(r, 'source')}
								class="border-b dark:border-gray-700 {r.moved
									? 'opacity-50'
									: 'cursor-move hover:bg-blue-50 dark:hover:bg-gray-700'}"
							>
								<td
									class="px-2 py-2 {r.moved
										? 'line-through text-gray-400'
										: 'text-blue-600 dark:text-blue-400'}">{r.address}</td
								>
								<td
									class="px-2 py-2 text-xs {r.moved
										? 'line-through text-gray-400'
										: 'dark:text-gray-300'}">{r.productCode}</td
								>
								<td
									class="px-2 py-2 {r.moved ? 'line-through text-gray-400' : 'dark:text-gray-200'}"
									>{r.product}
									{#if r.moved}<span
											class="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded"
											>✓</span
										>{/if}
								</td>
								<td
									class="px-2 py-2 text-center {r.moved
										? 'line-through text-gray-400'
										: 'dark:text-gray-200'}">{r.cartonPerPallet}</td
								>
								<td
									class="px-2 py-2 text-xs {r.moved
										? 'line-through text-gray-400'
										: 'dark:text-gray-300'}">{r.ipAddress}</td
								>
								<td
									class="px-2 py-2 text-xs {r.moved
										? 'line-through text-gray-400'
										: 'dark:text-gray-300'}">{r.deviceId}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if selectedSourceGroups.length}
			<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
				{searchSourceQuery ? 'No results found' : 'Select Line to display data'}
			</div>
		{:else}
			<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
				Select Line to display data
			</div>
		{/if}
	</Card>

	<!-- Target -->
	<Card size="xl" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold dark:text-white">Destination Rack</h2>
			<Button class="cursor-pointer" type="button" color="red" size="xs" onclick={clearAll}
				>Clear All</Button
			>
		</div>
		<div class="mb-4">
			<label class="block text-sm font-semibold mb-2 dark:text-gray-300"
				>Select Line (Ctrl + Click)</label
			>
			<select
				multiple
				on:change={handleTargetGroupChange}
				class="cursor-pointer w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-sm bg-blue-50 dark:bg-gray-700 dark:text-white"
				style="min-height:80px"
			>
				{#each Object.keys(targetGroups).sort() as g}
					<option value={g}>Line {g} ({targetGroups[g].length})</option>
				{/each}
			</select>
			{#if selectedTargetGroups.length}
				<div class="mt-2 flex gap-2 flex-wrap">
					{#each selectedTargetGroups as g}
						<span class="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Line {g}</span>
					{/each}
				</div>
			{/if}
		</div>

		{#if selectedTargetGroups.length}
			<div class="mb-3">
				<div class="relative">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<svg
							class="w-4 h-4 text-gray-500 dark:text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path>
						</svg>
					</div>
					<input
						type="text"
						bind:value={searchTargetQuery}
						placeholder="Search by address, product code, or name..."
						class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
					/>
				</div>
			</div>
		{/if}

		{#if filteredTarget.length}
			<div class="overflow-auto flex-1">
				<table class="w-full text-sm">
					<thead class="sticky top-0 bg-blue-50 dark:bg-gray-700 z-10">
						<tr>
							<th class="px-2 py-2 text-left dark:text-gray-300">Address</th>
							<th class="px-2 py-2 text-left dark:text-gray-300">Product Code</th>
							<th class="px-2 py-2 text-left dark:text-gray-300">Description</th>
							<th class="px-2 py-2 dark:text-gray-300">Ctn Capacity in Plt</th>
							<th class="px-2 py-2 dark:text-gray-300">Gateway DPD</th>
							<th class="px-2 py-2 dark:text-gray-300">ID DPD</th>
							<th class="px-2 py-2 dark:text-gray-300"></th>
						</tr>
					</thead>
					<tbody>
						{#each filteredTarget as r}
							<tr
								draggable={!!r.product}
								on:dragstart={() => r.product && handleDragStart(r, 'target')}
								on:dragover|preventDefault
								on:drop|preventDefault={() => handleDrop(r)}
								class="border-b dark:border-gray-700 {r.product
									? 'bg-blue-50 dark:bg-gray-700 cursor-move'
									: 'hover:bg-blue-50 dark:hover:bg-gray-700'}"
							>
								<td class="px-2 py-2 text-blue-600 dark:text-blue-400">{r.address}</td>
								<td class="px-2 py-2 text-xs dark:text-gray-300">{r.productCode || '-'}</td>
								<td class="px-2 py-2 dark:text-gray-200">
									{#if r.product}
										{r.product}
									{:else}
										<span class="text-gray-400 dark:text-gray-500 italic">Drop here</span>
									{/if}
								</td>
								<td class="px-2 py-2">
									{#if r.product}
										<input
											type="number"
											value={r.cartonPerPallet}
											on:input={(e) => updateTarget(r.id, 'cartonPerPallet', +e.target.value || 0)}
											class="w-16 px-1 py-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white"
											min="0"
										/>
									{:else}
										<span class="dark:text-gray-500">-</span>
									{/if}
								</td>
								<td class="px-2 py-2">
									{#if r.product}
										<input
											type="text"
											value={r.ipAddress}
											on:input={(e) => updateTarget(r.id, 'ipAddress', e.target.value)}
											class="w-full px-1 py-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white"
											placeholder=""
										/>
									{:else}
										<span class="dark:text-gray-500">-</span>
									{/if}
								</td>
								<td class="px-2 py-2">
									{#if r.product}
										<input
											type="text"
											value={r.deviceId}
											on:input={(e) => updateTarget(r.id, 'deviceId', e.target.value)}
											class="w-full px-1 py-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white"
											placeholder=""
										/>
									{:else}
										<span class="dark:text-gray-500">-</span>
									{/if}
								</td>
								<td class="px-2 py-2 text-center">
									{#if r.product}
										<Button
											class="cursor-pointer"
											size="xs"
											color="red"
											onclick={() => clearTarget(r.id)}
											type="button"
										>
											<TrashBinOutline class="w-4 h-4" />
										</Button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if selectedTargetGroups.length}
			<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
				{searchTargetQuery ? 'No results found' : 'Select line to display data'}
			</div>
		{:else}
			<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
				Select line to display data
			</div>
		{/if}
	</Card>
</div>

<!-- Preview -->
{#if mappingData.length}
	<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6 mt-6">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold dark:text-white">
				Preview Mapping Data ({mappingData.length} items)
			</h2>
			<Button
				class="cursor-pointer"
				type="button"
				color="green"
				size="xs"
				onclick={() => alert('Send to API: ' + JSON.stringify(mappingData))}
			>
				Update Planogram
			</Button>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm text-center">
				<thead class="bg-green-50 dark:bg-gray-700">
					<tr class="border-b dark:border-gray-600">
						<th class="px-3 py-2 dark:text-gray-300">No</th>
						<th class="px-3 py-2 dark:text-gray-300">Origin Address</th>
						<th class="px-3 py-2 dark:text-gray-300">→</th>
						<th class="px-3 py-2 dark:text-gray-300">Destination Address</th>
						<th class="px-3 py-2 dark:text-gray-300">Product Code</th>
						<th class="px-3 py-2 dark:text-gray-300">Description</th>
						<th class="px-3 py-2 dark:text-gray-300">Ctn Capacity in Plt</th>
						<th class="px-3 py-2 dark:text-gray-300">Gateway DPD</th>
						<th class="px-3 py-2 dark:text-gray-300">ID DPD</th>
					</tr>
				</thead>
				<tbody>
					{#each mappingData as d, i}
						<tr class="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700">
							<td class="px-3 py-2 dark:text-gray-200">{i + 1}</td>
							<td class="px-3 py-2 text-blue-600 dark:text-blue-400">{d.sourceAddress}</td>
							<td class="px-3 py-2 dark:text-gray-300">→</td>
							<td class="px-3 py-2 text-blue-600 dark:text-blue-400">{d.targetAddress}</td>
							<td class="px-3 py-2 text-xs dark:text-gray-300">{d.targetProductCode}</td>
							<td class="px-3 py-2 dark:text-gray-200">{d.product}</td>
							<td class="px-3 py-2 dark:text-gray-200">{d.cartonPerPallet}</td>
							<td class="px-3 py-2 text-xs dark:text-gray-300">{d.ipAddress || '-'}</td>
							<td class="px-3 py-2 text-xs dark:text-gray-300">{d.deviceId || '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
{/if}
