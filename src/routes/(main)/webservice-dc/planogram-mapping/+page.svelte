<script>
	import { Card, Button, Tabs, TabItem } from 'flowbite-svelte';
	import { TrashBinOutline, ArrowsRepeatOutline } from 'flowbite-svelte-icons';

	// Data dari +page.server.js
	export let data;

	// ─────────────────────────────────────────────
	// TAB 1 — Move Items
	// ─────────────────────────────────────────────

	// Tambahkan flag `moved: false` pada setiap source rack dari server
	let sourceRacks = data.moveSourceRacks.map((r) => ({ ...r, moved: false }));

	// Target racks dari server (sudah berisi sourceId: null, product: null, dll)
	let targetRacks = data.moveTargetRacks.map((r) => ({ ...r }));

	let draggedItem = null;
	let selectedSourceGroups = [];
	let selectedTargetGroups = [];
	let searchSourceQuery = '';
	let searchTargetQuery = '';

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
					(r.productCode && r.productCode.toLowerCase().includes(searchTargetQuery.toLowerCase())) ||
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
			const originalTarget = data.moveTargetRacks.find((r) => r.id === targetItem.id);
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
						ipAddress: originalTarget?.ipAddress ?? '',
						deviceId: originalTarget?.deviceId ?? '',
						sourceId: draggedItem.id
					}
					: r
			);
			sourceRacks = sourceRacks.map((r) => {
				if (r.id === draggedItem.id) return { ...r, moved: true };
				return r;
			});
		}
		if (draggedItem.source === 'target' && draggedItem.product) {
			targetRacks = targetRacks.map((r) => {
				const originalDragged = data.moveTargetRacks.find((o) => o.id === draggedItem.id);
				const originalTarget  = data.moveTargetRacks.find((o) => o.id === targetItem.id);

				if (r.id === targetItem.id) {
					return {
						...r,
						productCode:     draggedItem.productCode,
						product:         draggedItem.product,
						cartonPerPallet: draggedItem.cartonPerPallet,
						ipAddress:       originalTarget?.ipAddress ?? r.ipAddress,
						deviceId:        originalTarget?.deviceId ?? r.deviceId,
						sourceId:        draggedItem.sourceId
					};
				}
				if (r.id === draggedItem.id) {
					return {
						...r,
						productCode:     targetItem.productCode,
						product:         targetItem.product,
						cartonPerPallet: targetItem.cartonPerPallet,
						ipAddress:       originalDragged?.ipAddress ?? r.ipAddress,
						deviceId:        originalDragged?.deviceId ?? r.deviceId,
						sourceId:        targetItem.sourceId
					};
				}
				return r;
			});
		}
		draggedItem = null;
	}

	function clearTarget(id) {
		const t = targetRacks.find((r) => r.id === id);
		if (t?.sourceId) sourceRacks = sourceRacks.map((r) => (r.id === t.sourceId ? { ...r, moved: false } : r));
		const originalTarget = data.moveTargetRacks.find((r) => r.id === id);
		targetRacks = targetRacks.map((r) =>
        r.id === id
            ? {
                ...r,
                productCode: '',
                product: null,
                cartonPerPallet: originalTarget?.cartonPerPallet ?? 0,
                ipAddress: originalTarget?.ipAddress ?? '',
                deviceId: originalTarget?.deviceId ?? '',
                sourceId: null
              }
            : r
    	);
	}

	function clearAll() {
		sourceRacks = sourceRacks.map((r) => ({ ...r, moved: false }));
		targetRacks = targetRacks.map((r) => {
			const originalTarget = data.moveTargetRacks.find((o) => o.id === r.id);
			return {
				...r,
				productCode: '',
				product: null,
				cartonPerPallet: originalTarget?.cartonPerPallet ?? 0,
				ipAddress: originalTarget?.ipAddress ?? '',
				deviceId: originalTarget?.deviceId ?? '',
				sourceId: null
			};
		});
	}

	// ─────────────────────────────────────────────
	// TAB 2 — Switch Items
	// ─────────────────────────────────────────────

	// All racks (source + target merged) used as the pool for switching
	let switchRacks = data.switchRacks.map((r) => ({ ...r }));

	// The two sides of the switch
	let switchA = null;   // rack selected on left side
	let switchB = null;   // rack selected on right side

	// Search / filter for each panel
	let switchSearchA = '';
	let switchSearchB = '';
	let switchGroupA = [];
	let switchGroupB = [];

	// Pending switch pairs (staged, not yet confirmed)
	let switchPairs = [];

	$: switchGroups = switchRacks.reduce((g, r) => {
		const k = r.address.substring(0, 2);
		if (!g[k]) g[k] = [];
		g[k].push(r.address);
		return g;
	}, {});

	// IDs already staged in pending pairs
	$: stagedIds = switchPairs.flatMap((p) => [p.a.id, p.b.id]);

	$: filteredSwitchA = switchGroupA.length
		? switchRacks.filter((r) => {
				if (stagedIds.includes(r.id)) return false;
				const matchGroup = switchGroupA.includes(r.address.substring(0, 2));
				const matchSearch =
					switchSearchA === '' ||
					r.address.toLowerCase().includes(switchSearchA.toLowerCase()) ||
					r.productCode.toLowerCase().includes(switchSearchA.toLowerCase()) ||
					r.product.toLowerCase().includes(switchSearchA.toLowerCase());
				return matchGroup && matchSearch;
			})
		: [];

	$: filteredSwitchB = switchGroupB.length
		? switchRacks.filter((r) => {
				if (stagedIds.includes(r.id)) return false;
				// Allow selecting same rack for B only if it's not already chosen as A
				if (switchA && r.id === switchA.id) return false;
				const matchGroup = switchGroupB.includes(r.address.substring(0, 2));
				const matchSearch =
					switchSearchB === '' ||
					r.address.toLowerCase().includes(switchSearchB.toLowerCase()) ||
					r.productCode.toLowerCase().includes(switchSearchB.toLowerCase()) ||
					r.product.toLowerCase().includes(switchSearchB.toLowerCase());
				return matchGroup && matchSearch;
			})
		: [];

	function handleSwitchGroupAChange(e) {
		switchGroupA = Array.from(e.target.selectedOptions, (o) => o.value);
		switchA = null;
	}

	function handleSwitchGroupBChange(e) {
		switchGroupB = Array.from(e.target.selectedOptions, (o) => o.value);
		switchB = null;
	}

	function selectSwitchA(rack) {
		switchA = switchA?.id === rack.id ? null : rack;
	}

	function selectSwitchB(rack) {
		switchB = switchB?.id === rack.id ? null : rack;
	}

	function addSwitchPair() {
		if (!switchA || !switchB) return;
		switchPairs = [...switchPairs, { id: Date.now(), a: { ...switchA }, b: { ...switchB } }];
		switchA = null;
		switchB = null;
	}

	function removeSwitchPair(pairId) {
		switchPairs = switchPairs.filter((p) => p.id !== pairId);
	}

	function clearAllSwitchPairs() {
		switchPairs = [];
		switchA = null;
		switchB = null;
	}

	// Preview: what each rack looks like AFTER all switches applied
	$: switchPreview = (() => {
		// Build a map of id -> rack (mutable copy)
		const map = Object.fromEntries(switchRacks.map((r) => [r.id, { ...r }]));
		for (const pair of switchPairs) {
			const a = map[pair.a.id];
			const b = map[pair.b.id];
			// Swap product info only; address, ipAddress, deviceId stay with the rack
			const tmpCode = a.productCode;
			const tmpProduct = a.product;
			const tmpCpp = a.cartonPerPallet;
			a.productCode = b.productCode;
			a.product = b.product;
			a.cartonPerPallet = b.cartonPerPallet;
			b.productCode = tmpCode;
			b.product = tmpProduct;
			b.cartonPerPallet = tmpCpp;
		}
		return switchPairs.flatMap((pair) => [map[pair.a.id], map[pair.b.id]]);
	})();

	function confirmSwitch() {
		// Apply all switch pairs to switchRacks
		switchRacks = (() => {
			const map = Object.fromEntries(switchRacks.map((r) => [r.id, { ...r }]));
			for (const pair of switchPairs) {
				const a = map[pair.a.id];
				const b = map[pair.b.id];
				const tmpCode = a.productCode, tmpProduct = a.product, tmpCpp = a.cartonPerPallet;
				a.productCode = b.productCode; a.product = b.product; a.cartonPerPallet = b.cartonPerPallet;
				b.productCode = tmpCode; b.product = tmpProduct; b.cartonPerPallet = tmpCpp;
			}
			return Object.values(map);
		})();
		switchPairs = [];
	}

	// ─────────────────────────────────────────────
	// Modal Konfirmasi
	// ─────────────────────────────────────────────
	let showConfirmModal = false;
	let confirmModalType = ''; // 'move' | 'switch'
	let confirmModalTitle = '';
	let confirmModalMessage = '';
	let onConfirmAction = null;

	function openConfirmModal(type) {
		confirmModalType = type;
		if (type === 'move') {
			confirmModalTitle = 'Konfirmasi Update Planogram';
			confirmModalMessage = `Anda akan memperbarui planogram untuk ${mappingData.length} item. Apakah Anda yakin ingin melanjutkan?`;
			onConfirmAction = () => {
				alert('Send to API: ' + JSON.stringify(mappingData));
				clearAll();
				showConfirmModal = false;
			};
		} else if (type === 'switch') {
			confirmModalTitle = 'Konfirmasi Switch Planogram';
			confirmModalMessage = `Anda akan menukar produk pada ${switchPairs.length} pasang rack. Apakah Anda yakin ingin melanjutkan?`;
			onConfirmAction = () => {
				alert('Send to API: ' + JSON.stringify(switchPairs));
				confirmSwitch();
				showConfirmModal = false;
			};
		}
		showConfirmModal = true;
	}

	function closeConfirmModal() {
		showConfirmModal = false;
		onConfirmAction = null;
	}

	function handleConfirm() {
		if (onConfirmAction) onConfirmAction();
	}

	function updateTarget(id, field, val) {
		targetRacks = targetRacks.map((r) => (r.id === id ? { ...r, [field]: val } : r));
	}
</script>

<Tabs style="underline" class="mb-6">
	<!-- ═══════════════════════════════════════════
	     TAB 1 — Move Items
	═══════════════════════════════════════════ -->
	<TabItem open title="Move Items">
		<!-- Instruction banner -->
		<div class="mb-5 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-800 dark:text-blue-300">
			<strong>Cara penggunaan:</strong> Pilih line pada panel <strong>Origin Rack</strong> untuk menampilkan daftar rack asal,
			lalu <strong>drag &amp; drop</strong> baris rack ke tabel <strong>Destination Rack</strong> yang sesuai.
			Setelah semua rack terpetakan, klik tombol <strong>Update Planogram</strong> untuk menyimpan perubahan.
			Gunakan tombol <strong>Clear (Trash Bin)</strong> per baris atau <strong>Clear All</strong> untuk membatalkan mapping.
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Source -->
			<Card size="xl" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col">
				<h2 class="text-xl font-semibold mb-4 dark:text-white">Origin Rack</h2>
				<div class="mb-4">
					<label class="block text-sm font-semibold mb-2 dark:text-gray-300">Select Line (Ctrl + Click)</label>
					<select multiple on:change={handleSourceGroupChange}
						class="cursor-pointer w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-sm bg-blue-50 dark:bg-gray-700 dark:text-white"
						style="min-height:40px">
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
								<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<input type="text" bind:value={searchSourceQuery} placeholder="Search by address, product code, or name..."
								class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent" />
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
									<tr draggable={!r.moved} on:dragstart={() => !r.moved && handleDragStart(r, 'source')}
										class="border-b dark:border-gray-700 {r.moved ? 'opacity-50' : 'cursor-move hover:bg-blue-50 dark:hover:bg-gray-700'}">
										<td class="px-2 py-2 {r.moved ? 'line-through text-gray-400' : 'text-blue-600 dark:text-blue-400'}">{r.address}</td>
										<td class="px-2 py-2 text-xs {r.moved ? 'line-through text-gray-400' : 'dark:text-gray-300'}">{r.productCode}</td>
										<td class="px-2 py-2 {r.moved ? 'line-through text-gray-400' : 'dark:text-gray-200'}">{r.product}
											{#if r.moved}<span class="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">✓</span>{/if}
										</td>
										<td class="px-2 py-2 text-center {r.moved ? 'line-through text-gray-400' : 'dark:text-gray-200'}">{r.cartonPerPallet}</td>
										<td class="px-2 py-2 text-xs {r.moved ? 'line-through text-gray-400' : 'dark:text-gray-300'}">{r.ipAddress}</td>
										<td class="px-2 py-2 text-xs {r.moved ? 'line-through text-gray-400' : 'dark:text-gray-300'}">{r.deviceId}</td>
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
					<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">Select Line to display data</div>
				{/if}
			</Card>

			<!-- Target -->
			<Card size="xl" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold dark:text-white">Destination Rack</h2>
					<Button class="cursor-pointer" type="button" color="red" size="xs" onclick={clearAll}>Clear All</Button>
				</div>
				<div class="mb-4">
					<label class="block text-sm font-semibold mb-2 dark:text-gray-300">Select Line (Ctrl + Click)</label>
					<select multiple on:change={handleTargetGroupChange}
						class="cursor-pointer w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-sm bg-blue-50 dark:bg-gray-700 dark:text-white"
						style="min-height:80px">
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
								<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<input type="text" bind:value={searchTargetQuery} placeholder="Search by address, product code, or name..."
								class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent" />
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
									<tr draggable={!!r.product} on:dragstart={() => r.product && handleDragStart(r, 'target')}
										on:dragover|preventDefault on:drop|preventDefault={() => handleDrop(r)}
										class="border-b dark:border-gray-700 {r.product ? 'bg-blue-50 dark:bg-gray-700 cursor-move' : 'hover:bg-blue-50 dark:hover:bg-gray-700'}">
										<td class="px-2 py-2 text-blue-600 dark:text-blue-400">{r.address}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.productCode || '-'}</td>
										<td class="px-2 py-2 dark:text-gray-200">
											{#if r.product}{r.product}{:else}<span class="text-gray-400 dark:text-gray-500 italic">Drop here</span>{/if}
										</td>
										<td class="px-2 py-2">
											{#if r.product}
												<input type="number" value={r.cartonPerPallet} on:input={(e) => updateTarget(r.id, 'cartonPerPallet', +e.target.value || 0)}
													class="w-16 px-1 py-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white" min="0" />
											{:else}<span class="dark:text-gray-500">-</span>{/if}
										</td>
										<td class="px-2 py-2">
											{#if r.product}
												<input type="text" value={r.ipAddress} on:input={(e) => updateTarget(r.id, 'ipAddress', e.target.value)}
													class="w-full px-1 py-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white" />
											{:else}
												<span class="text-xs dark:text-gray-500">{r.ipAddress || '-'}</span>
											{/if}
										</td>
										<td class="px-2 py-2">
											{#if r.product}
												<input type="text" value={r.deviceId} on:input={(e) => updateTarget(r.id, 'deviceId', e.target.value)}
													class="w-full px-1 py-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 dark:text-white" />
											{:else}
												<span class="text-xs dark:text-gray-500">{r.deviceId || '-'}</span>
											{/if}
										</td>
										<td class="px-2 py-2 text-center">
											{#if r.product}
												<Button class="cursor-pointer" size="xs" color="red" onclick={() => clearTarget(r.id)} type="button">
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
					<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">Select line to display data</div>
				{/if}
			</Card>
		</div>

		<!-- Preview -->
		{#if mappingData.length}
			<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6 mt-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold dark:text-white">Preview Mapping Data ({mappingData.length} items)</h2>
					<Button class="cursor-pointer gap-2" type="button" color="green" size="sm"
						onclick={() => openConfirmModal('move')}>
						Konfirmasi Move Planogram
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
	</TabItem>

	<!-- ═══════════════════════════════════════════
	     TAB 2 — Switch Items
	═══════════════════════════════════════════ -->
	<TabItem title="Switch Items">
		<!-- Instruction banner -->
		<div class="mb-5 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-800 dark:text-blue-300">
			<strong>Cara penggunaan:</strong> Pilih line pada panel kiri dan kanan, klik baris rack yang ingin ditukar, lalu klik tombol
			<strong>↔ Tambah Switch</strong>. Ulangi untuk menambah pasangan switch lainnya. Setelah semua pasangan terdaftar, klik
			<strong>Konfirmasi Switch Planogram</strong>.
		</div>

		<!-- Two-panel selector -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

			<!-- Panel A -->
			<Card size="xl" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col">
				<h2 class="text-xl font-semibold mb-3 dark:text-white">
					Rack A
					{#if switchA}
						<span class="ml-2 px-2 py-0.5 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
							{switchA.address} — {switchA.productCode}
						</span>
					{/if}
				</h2>

				<div class="mb-3">
					<label class="block text-sm font-semibold mb-1 dark:text-gray-300">Select Line (Ctrl + Click)</label>
					<select multiple on:change={handleSwitchGroupAChange}
						class="cursor-pointer w-full px-3 py-2 border-2 border-orange-300 dark:border-orange-700 rounded-sm bg-orange-50 dark:bg-gray-700 dark:text-white"
						style="min-height:40px">
						{#each Object.keys(switchGroups).sort() as g}
							<option value={g}>Line {g} ({switchGroups[g].length})</option>
						{/each}
					</select>
				</div>

				{#if switchGroupA.length}
					<div class="mb-3">
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<input type="text" bind:value={switchSearchA} placeholder="Search address / product code / name..."
								class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
						</div>
					</div>
				{/if}

				{#if filteredSwitchA.length}
					<div class="overflow-auto flex-1">
						<table class="w-full text-sm">
							<thead class="sticky top-0 bg-orange-50 dark:bg-gray-700 z-10">
								<tr>
									<th class="px-2 py-2 text-left dark:text-gray-300">Address</th>
									<th class="px-2 py-2 text-left dark:text-gray-300">Product Code</th>
									<th class="px-2 py-2 text-left dark:text-gray-300">Description</th>
									<th class="px-2 py-2 dark:text-gray-300">Gateway DPD</th>
									<th class="px-2 py-2 dark:text-gray-300">ID DPD</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredSwitchA as r}
									<tr on:click={() => selectSwitchA(r)}
										class="border-b dark:border-gray-700 cursor-pointer transition-colors
											{switchA?.id === r.id
												? 'bg-orange-200 dark:bg-orange-800'
												: 'hover:bg-orange-50 dark:hover:bg-gray-700'}">
										<td class="px-2 py-2 text-orange-600 dark:text-orange-400 font-medium">{r.address}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.productCode}</td>
										<td class="px-2 py-2 dark:text-gray-200">{r.product}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.ipAddress}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.deviceId}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if switchGroupA.length}
					<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
						{switchSearchA ? 'No results found' : 'No available racks'}
					</div>
				{:else}
					<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Select Line to display racks</div>
				{/if}
			</Card>

			<!-- Panel B -->
			<Card size="xl" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col">
				<h2 class="text-xl font-semibold mb-3 dark:text-white">
					Rack B
					{#if switchB}
						<span class="ml-2 px-2 py-0.5 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
							{switchB.address} — {switchB.productCode}
						</span>
					{/if}
				</h2>

				<div class="mb-3">
					<label class="block text-sm font-semibold mb-1 dark:text-gray-300">Select Line (Ctrl + Click)</label>
					<select multiple on:change={handleSwitchGroupBChange}
						class="cursor-pointer w-full px-3 py-2 border-2 border-purple-300 dark:border-purple-700 rounded-sm bg-purple-50 dark:bg-gray-700 dark:text-white"
						style="min-height:40px">
						{#each Object.keys(switchGroups).sort() as g}
							<option value={g}>Line {g} ({switchGroups[g].length})</option>
						{/each}
					</select>
				</div>

				{#if switchGroupB.length}
					<div class="mb-3">
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<input type="text" bind:value={switchSearchB} placeholder="Search address / product code / name..."
								class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
						</div>
					</div>
				{/if}

				{#if filteredSwitchB.length}
					<div class="overflow-auto flex-1">
						<table class="w-full text-sm">
							<thead class="sticky top-0 bg-purple-50 dark:bg-gray-700 z-10">
								<tr>
									<th class="px-2 py-2 text-left dark:text-gray-300">Address</th>
									<th class="px-2 py-2 text-left dark:text-gray-300">Product Code</th>
									<th class="px-2 py-2 text-left dark:text-gray-300">Description</th>
									<th class="px-2 py-2 dark:text-gray-300">Gateway DPD</th>
									<th class="px-2 py-2 dark:text-gray-300">ID DPD</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredSwitchB as r}
									<tr on:click={() => selectSwitchB(r)}
										class="border-b dark:border-gray-700 cursor-pointer transition-colors
											{switchB?.id === r.id
												? 'bg-purple-200 dark:bg-purple-800'
												: 'hover:bg-purple-50 dark:hover:bg-gray-700'}">
										<td class="px-2 py-2 text-purple-600 dark:text-purple-400 font-medium">{r.address}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.productCode}</td>
										<td class="px-2 py-2 dark:text-gray-200">{r.product}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.ipAddress}</td>
										<td class="px-2 py-2 text-xs dark:text-gray-300">{r.deviceId}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if switchGroupB.length}
					<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
						{switchSearchB ? 'No results found' : 'No available racks'}
					</div>
				{:else}
					<div class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Select Line to display racks</div>
				{/if}
			</Card>
		</div>

		<!-- Add switch pair button -->
		<div class="flex justify-center mb-6">
			<Button
				type="button"
				color="blue"
				disabled={!switchA || !switchB}
				onclick={addSwitchPair}
				class="cursor-pointer px-8 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<ArrowsRepeatOutline class="w-5 h-5" />
				↔ Tambah Switch
				{#if switchA && switchB}
					&nbsp;({switchA.address} ↔ {switchB.address})
				{/if}
			</Button>
		</div>

		<!-- Staged switch pairs list -->
		{#if switchPairs.length}
			<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6 mb-6">
				<div class="flex justify-between items-center mb-3">
					<h3 class="text-lg font-semibold dark:text-white">
						Daftar Switch ({switchPairs.length} pasang)
					</h3>
					<Button type="button" color="red" size="xs" class="cursor-pointer" onclick={clearAllSwitchPairs}>
						Clear All
					</Button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="bg-blue-50 dark:bg-gray-700">
							<tr class="border-b dark:border-gray-600">
								<th class="px-3 py-2 dark:text-gray-300">No</th>
								<th class="px-3 py-2 text-left text-orange-600 dark:text-orange-400">Rack A — Address</th>
								<th class="px-3 py-2 text-left text-orange-600 dark:text-orange-400">Rack A — Product Code</th>
								<th class="px-3 py-2 text-left text-orange-600 dark:text-orange-400">Rack A — Description</th>
								<th class="px-3 py-2 dark:text-gray-300">↔</th>
								<th class="px-3 py-2 text-left text-purple-600 dark:text-purple-400">Rack B — Address</th>
								<th class="px-3 py-2 text-left text-purple-600 dark:text-purple-400">Rack B — Product Code</th>
								<th class="px-3 py-2 text-left text-purple-600 dark:text-purple-400">Rack B — Description</th>
								<th class="px-3 py-2 dark:text-gray-300"></th>
							</tr>
						</thead>
						<tbody>
							{#each switchPairs as pair, i}
								<tr class="border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700">
									<td class="px-3 py-2 text-center dark:text-gray-200">{i + 1}</td>
									<td class="px-3 py-2 text-orange-600 dark:text-orange-400 font-medium">{pair.a.address}</td>
									<td class="px-3 py-2 text-xs dark:text-gray-300">{pair.a.productCode}</td>
									<td class="px-3 py-2 dark:text-gray-200">{pair.a.product}</td>
									<td class="px-3 py-2 text-center text-blue-500 dark:text-blue-400 text-lg font-bold">↔</td>
									<td class="px-3 py-2 text-purple-600 dark:text-purple-400 font-medium">{pair.b.address}</td>
									<td class="px-3 py-2 text-xs dark:text-gray-300">{pair.b.productCode}</td>
									<td class="px-3 py-2 dark:text-gray-200">{pair.b.product}</td>
									<td class="px-3 py-2 text-center">
										<Button size="xs" color="red" type="button" class="cursor-pointer" onclick={() => removeSwitchPair(pair.id)}>
											<TrashBinOutline class="w-4 h-4" />
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>

			<!-- Preview after switch -->
			<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6 mb-6">
				<div class="flex justify-between items-center mb-3">
					<h3 class="text-lg font-semibold dark:text-white">
						Preview Hasil Switch ({switchPreview.length} rack terpengaruh)
					</h3>
					<Button type="button" color="green" size="sm" class="cursor-pointer gap-2"
						onclick={() => openConfirmModal('switch')}>
						<ArrowsRepeatOutline class="w-4 h-4" />
						Konfirmasi Switch Planogram
					</Button>
				</div>
				<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
					Kolom <span class="font-semibold">Address, Gateway DPD, dan ID DPD</span> tetap, hanya
					<span class="font-semibold">Product Code & Description</span> yang ditukar antar alamat.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-center">
						<thead class="bg-green-50 dark:bg-gray-700">
							<tr class="border-b dark:border-gray-600">
								<th class="px-3 py-2 dark:text-gray-300">No</th>
								<th class="px-3 py-2 dark:text-gray-300">Address</th>
								<th class="px-3 py-2 dark:text-gray-300">Product Code (Baru)</th>
								<th class="px-3 py-2 dark:text-gray-300">Description (Baru)</th>
								<th class="px-3 py-2 dark:text-gray-300">Ctn Capacity in Plt</th>
								<th class="px-3 py-2 dark:text-gray-300">Gateway DPD</th>
								<th class="px-3 py-2 dark:text-gray-300">ID DPD</th>
							</tr>
						</thead>
						<tbody>
							{#each switchPreview as r, i}
								<tr class="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700">
									<td class="px-3 py-2 dark:text-gray-200">{i + 1}</td>
									<td class="px-3 py-2 text-blue-600 dark:text-blue-400 font-medium">{r.address}</td>
									<td class="px-3 py-2 text-xs dark:text-gray-300">{r.productCode}</td>
									<td class="px-3 py-2 dark:text-gray-200">{r.product}</td>
									<td class="px-3 py-2 dark:text-gray-200">{r.cartonPerPallet}</td>
									<td class="px-3 py-2 text-xs dark:text-gray-300">{r.ipAddress}</td>
									<td class="px-3 py-2 text-xs dark:text-gray-300">{r.deviceId}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		{:else}
			<div class="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500 text-sm">
				Belum ada pasangan switch. Pilih Rack A dan Rack B lalu klik tombol <strong class="mx-1">↔ Tambah Switch</strong>.
			</div>
		{/if}
	</TabItem>
</Tabs>

<!-- ═══════════════════════════════════════════
     Modal Konfirmasi
═══════════════════════════════════════════ -->
{#if showConfirmModal}
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background-color: rgba(0,0,0,0.5);">
        
        <!-- Modal Box -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            
            <!-- Header -->
            <div class="flex items-center gap-3">
                {#if confirmModalType === 'move'}
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                {:else}
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                {/if}
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{confirmModalTitle}</h3>
            </div>

            <!-- Body -->
            <p class="text-sm text-gray-600 dark:text-gray-300">{confirmModalMessage}</p>

            <!-- Preview ringkas -->
            {#if confirmModalType === 'move'}
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Daftar mapping yang akan disimpan:</p>
                    {#each mappingData as d, i}
                        <div class="flex items-center gap-2 text-xs py-1 border-b dark:border-gray-600 last:border-0">
                            <span class="font-mono text-blue-600 dark:text-blue-400">{d.sourceAddress}</span>
                            <span class="text-gray-400">→</span>
                            <span class="font-mono text-blue-600 dark:text-blue-400">{d.targetAddress}</span>
                            <span class="text-gray-500 dark:text-gray-400 truncate">{d.product}</span>
                        </div>
                    {/each}
                </div>
            {:else if confirmModalType === 'switch'}
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Pasangan rack yang akan ditukar:</p>
                    {#each switchPairs as pair, i}
                        <div class="flex items-center gap-2 text-xs py-1 border-b dark:border-gray-600 last:border-0">
                            <span class="font-mono text-orange-600 dark:text-orange-400">{pair.a.address}</span>
                            <span class="text-gray-500 dark:text-gray-400 truncate">({pair.a.product})</span>
                            <span class="text-blue-500 font-bold">↔</span>
                            <span class="font-mono text-purple-600 dark:text-purple-400">{pair.b.address}</span>
                            <span class="text-gray-500 dark:text-gray-400 truncate">({pair.b.product})</span>
                        </div>
                    {/each}
                </div>
            {/if}

            <!-- Footer Buttons -->
            <div class="flex justify-end gap-3 pt-2">
                <button type="button" on:click={closeConfirmModal}
                    class="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    Batal
                </button>
                <button type="button" on:click={handleConfirm}
                    class="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                        {confirmModalType === 'move'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'}">
                    {confirmModalType === 'move' ? 'Ya, Update Planogram' : 'Ya, Konfirmasi Switch'}
                </button>
            </div>
        </div>
    </div>
{/if}