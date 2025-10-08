<script>
	import { 
		Card, 
		Heading, 
		Label, 
		Input, 
		Button, 
		Table, 
		TableHead, 
		TableHeadCell, 
		TableBody, 
		TableBodyRow, 
		TableBodyCell, 
		Modal, 
		Select,
		Spinner,
		Toast,
		MultiSelect 
	} from 'flowbite-svelte';
	import { PlusOutline, TrashBinOutline, CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';
	import { showSuccess, showError, showWarning, showInfo, handleApiResponse } from '$lib/utils/alertUtils.js';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	// State variables
	let pluId = '';
	let officeId = data.officeId || '';
	
	// Data Tabel Lokasi
	let descPlano = '';
	let itemPlano = '';
	let tipePlano = '';
	let zonaPlano = '';
	let linePlano = '';
	let rakPlano = '';
	let shelfPlano = '';
	let cellPlano = '';

	// Table rows untuk nearest groups
	/** @type {Array<{id: number, line: string, rak: string[], lineOptions: Array<{value: string, name: string}>, rakOptions: Array<{value: string, name: string}>}>} */
	let nearestGroups = [];
	
	let counter = 0;
	let showModal = false;
	let isLoading = false;
	let isLoadingData = false;
	let isAddingRow = false;
	
	/**
	 * Load planogram data menggunakan form action
	 */
	async function loadPlanogramData() {
		if (!pluId || !officeId) {
			clearPlanogramData();
			return;
		}

		isLoadingData = true;

		try {
			const formData = new FormData();
			formData.append('office', officeId);
			formData.append('pluid', pluId);

			const response = await fetch('?/getTableLokPlano', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			let parsedData;
			try {
				parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
			} catch (err) {
				console.error('Gagal parse JSON data:', err);
				parsedData = null;
			}

			if (result.type === 'success' && Array.isArray(parsedData)) {
				const apiData = parsedData[2];

				const resolve = (val) => (typeof val === 'number' ? parsedData[val] : val || '');
				
				descPlano = resolve(apiData.mbr_full_nama);
				itemPlano = resolve(apiData.pla_zonabarang);
				tipePlano = resolve(apiData.pla_fk_tipe);
				zonaPlano = resolve(apiData.pla_zona);
				linePlano = resolve(apiData.pla_line);
				rakPlano = resolve(apiData.pla_rak);
				shelfPlano = resolve(apiData.pla_shelf);
				cellPlano = resolve(apiData.pla_cell);
				
				if (descPlano) {
					showInfo('Data planogram berhasil dimuat');
				} else {
					showWarning('Data tidak ditemukan');
				}
			} else {
				clearPlanogramData();
				showWarning(result.data?.error || 'Data tidak ditemukan');
			}
		} catch (error) {
			console.error('Error loading planogram data:', error);
			clearPlanogramData();
			showError('Gagal memuat data: ' + error.message);
		} finally {
			isLoadingData = false;
		}
		
		resetTable();
	}

	/**
	 * Clear semua field planogram data
	 */
	function clearPlanogramData() {
		descPlano = '';
		itemPlano = '';
		tipePlano = '';
		zonaPlano = '';
		linePlano = '';
		rakPlano = '';
		shelfPlano = '';
		cellPlano = '';
	}

	/**
	 * Reset table nearest groups
	 */
	function resetTable() {
		nearestGroups = [];
		counter = 0;
	}

	/**
	 * Add new row untuk nearest group
	 */
	async function addNearestGroup() {
		if (!tipePlano) {
			showWarning('Silakan input PLUID terlebih dahulu');
			return;
		}

		isAddingRow = true;
		counter++;
		
		let lineOptions = [];
		
		try {
			const formData = new FormData();
			formData.append('tiperak', tipePlano);

			const response = await fetch('?/getZonaRak', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success' && result.data) {
				// Parse string JSON di dalam result.data
				let parsedData;
				try {
					parsedData = JSON.parse(result.data);
				} catch (e) {
					console.error('Gagal parse result.data:', e);
					showError('Format data tidak valid dari server');
					return;
				}

				// Pair setiap objek {pla_zonarak: X} dengan string setelahnya
				for (let i = 0; i < parsedData.length; i++) {
					const item = parsedData[i];
					const nextItem = parsedData[i + 1];

					// Pastikan formatnya benar
					if (typeof item === 'object' && item.pla_zonarak && typeof nextItem === 'string') {
						lineOptions.push({
							value: item.pla_zonarak,
							name: nextItem
						});
						i++; // skip item berikutnya karena sudah dipakai sebagai nama
					}
				}

				// Jika data kosong
				if (lineOptions.length === 0) {
					showWarning('Data line kosong');
				}
			} else {
				showError('Gagal memuat data line');
			}
		} catch (error) {
			console.error('Error fetching zone rak:', error);
			showError('Gagal memuat data line');
		} finally {
			isAddingRow = false;
		}

		nearestGroups = [...nearestGroups, {
			id: counter,
			line: '',
			rak: [],
			lineOptions,
			rakOptions: []
		}];
	}

	/**
	 * Handle line change event
	 */
	async function onLineChange(index) {
		const group = nearestGroups[index];
		
		if (!group.line || !tipePlano) {
			group.rakOptions = [];
			nearestGroups = nearestGroups;
			return;
		}

		try {
			// Temukan label line (huruf) berdasarkan value yang dipilih
			const selectedLineOption = group.lineOptions.find(opt => opt.value == group.line);
			const lineLabel = selectedLineOption ? selectedLineOption.name : group.line;

			const formData = new FormData();
			formData.append('tiperak', tipePlano);
			formData.append('linerak', lineLabel);

			const response = await fetch('?/getLineRak', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success' && result.data) {
				let parsedData;
				try {
					parsedData = JSON.parse(result.data);
				} catch (e) {
					console.error('Gagal parse result.data:', e);
					showError('Format data tidak valid dari server');
					return;
				}

				console.log('Parsed Data (getLineRak):', parsedData);

				const rakOptions = [];

				// Pair setiap objek {pla_rak: X} dengan string setelahnya
				for (let i = 0; i < parsedData.length; i++) {
				const item = parsedData[i];
				const nextItem = parsedData[i + 1];

					if (typeof item === 'object' && item.pla_rak && typeof nextItem === 'string') {
						rakOptions.push({
							value: item.pla_rak,
							name: nextItem
						});
						i++; // lewati elemen label
					}
				}

				group.rakOptions = rakOptions;
				group.rak = [];
				nearestGroups = nearestGroups;

				if (rakOptions.length === 0) {
					showWarning('Data rak kosong');
				}
			} else {
				showError('Gagal memuat data rak');
			}
		} catch (error) {
			console.error('Error fetching line rak:', error);
			showError('Gagal memuat data rak');
		}
	}

	/**
	 * Remove nearest group row
	 */
	function removeNearestGroup(index) {
		nearestGroups = nearestGroups.filter((_, i) => i !== index);
		showSuccess('Baris berhasil dihapus');
	}

	/**
	 * Reset form ke kondisi awal
	 */
	function resetForm() {
		pluId = '';
		clearPlanogramData();
		resetTable();
	}

	/**
	 * Debounce untuk input PLUID
	 */
	let debounceTimer;
	function debouncedLoadData() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(loadPlanogramData, 500);
	}

	/**
	 * Handle posting confirmation from modal
	 */
	async function handlePostingConfirm() {
		if (isLoading) return;
		isLoading = true;

		try {
			// Ambil data form dari elemen form HTML
			const formEl = document.querySelector('form[action="?/submit"]');
			const formData = new FormData(formEl);

			// Kirim POST request manual ke server
			const response = await fetch(formEl.action, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success' || result.success) {
				showSuccess('Data berhasil diposting!');
				resetForm();
			} else {
				showError('Gagal memposting data!');
			}
		} catch (error) {
			console.error('Error posting data:', error);
			showError('Terjadi kesalahan saat mengirim data.');
		} finally {
			isLoading = false;
			showModal = false;
		}
	}

	/**
	 * Handle logout cancel from modal
	 */
	function handlePostingCancel() {
		showModal = false;
	}

</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<div class="mb-6">
		<Heading tag="h3" class="mb-2 text-xl font-semibold dark:text-white">
			Group Pertemanan Tabel Lokasi Planogram
		</Heading>
	</div>

	<form 
		method="POST" 
		action="?/submit"
		on:submit|preventDefault={() => showModal = true}
	>
		<!-- Hidden inputs untuk form data -->
		<input type="hidden" name="officeId" value={officeId} readonly/>
		<input type="hidden" name="pluId" value={pluId} readonly/>
		<input type="hidden" name="tipePlano" value={tipePlano} readonly/>
		<input
			type="hidden"
			name="nearestGroups"
			value={JSON.stringify(
				nearestGroups.map(g => {
					// Ambil nama line (label)
					const lineName = g.lineOptions.find(opt => opt.value == g.line)?.name || g.line;

					// Ambil nama setiap rak (label)
					const rakNames = g.rak.map(rVal => {
						return g.rakOptions.find(opt => opt.value == rVal)?.name || rVal;
					});

					return { line: lineName, rak: rakNames };
				})
			)}
			readonly
		/>

		<!-- Data Item Section -->
		<div class="mb-6">
			<Heading tag="h4" class="mb-4 flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300">
				<span class="mr-2"></span> Data Item
			</Heading>
			<div class="grid gap-4">
				<div class="relative">
					<Label for="plu-id" class="mb-2">PLUID</Label>
					<Input
						id="plu-id"
						type="text"
						placeholder="Enter PLUID"
						bind:value={pluId}
						oninput={debouncedLoadData}
						required
					/>
					{#if isLoadingData}
						<div class="absolute right-3 top-10">
							<Spinner size="4" />
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Data Tabel Lokasi Section -->
		<div class="mb-6">
			<Heading tag="h4" class="mb-4 flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300">
				<span class="mr-2"></span> Data Tabel Lokasi
			</Heading>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<Label for="desc-plano" class="mb-2">Deskripsi</Label>
					<Input id="desc-plano" type="text" bind:value={descPlano} readonly />
				</div>
				<div>
					<Label for="item-plano" class="mb-2">Tipe Item</Label>
					<Input id="item-plano" type="text" bind:value={itemPlano} readonly />
				</div>
				<div>
					<Label for="tipe-plano" class="mb-2">Tipe Rak</Label>
					<Input id="tipe-plano" type="text" bind:value={tipePlano} readonly />
				</div>
				<div>
					<Label for="zona-plano" class="mb-2">Zona</Label>
					<Input id="zona-plano" type="text" bind:value={zonaPlano} readonly />
				</div>
				<div>
					<Label for="line-plano" class="mb-2">Line</Label>
					<Input id="line-plano" type="text" bind:value={linePlano} readonly />
				</div>
				<div>
					<Label for="rak-plano" class="mb-2">Rak</Label>
					<Input id="rak-plano" type="text" bind:value={rakPlano} readonly />
				</div>
				<div>
					<Label for="shelf-plano" class="mb-2">Shelf</Label>
					<Input id="shelf-plano" type="text" bind:value={shelfPlano} readonly />
				</div>
				<div>
					<Label for="cell-plano" class="mb-2">Cell</Label>
					<Input id="cell-plano" type="text" bind:value={cellPlano} readonly />
				</div>
			</div>
		</div>

		<!-- Data Pertemanan Section -->
		<div class="mb-6">
			<Heading tag="h4" class="mb-4 flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300">
				<span class="mr-2"></span> Data Pertemanan
			</Heading>
			
			<Table striped={true}>
				<TableHead class="text-center">
					<TableHeadCell>Line</TableHeadCell>
					<TableHeadCell>Rak</TableHeadCell>
					<TableHeadCell>
						<Button class="cursor-pointer" size="xs" color="green" onclick={addNearestGroup} type="button" disabled={isAddingRow}>
							{#if isAddingRow}
								<Spinner size="4" class="mr-1" />
							{:else}
								<PlusOutline class="w-4 h-4" />
							{/if}
						</Button>
					</TableHeadCell>
				</TableHead>
				<TableBody>
					{#if nearestGroups.length === 0}
						<TableBodyRow>
							<TableBodyCell colspan="3" class="text-center text-gray-500">
								Belum ada data. Klik tombol + untuk menambah data pertemanan.
							</TableBodyCell>
						</TableBodyRow>
					{:else}
						{#each nearestGroups as group, index}
							<TableBodyRow>
								<TableBodyCell>
									<Select
										items={group.lineOptions}
										bind:value={group.line}
										onchange={() => onLineChange(index)}
										placeholder="Please Select"
										required
									/>
								</TableBodyCell>
								<TableBodyCell>
									<MultiSelect 
										items={group.rakOptions}
										bind:value={group.rak}
										placeholder="Please Select"
										required
									/>
								</TableBodyCell>
								<TableBodyCell class="text-center">
									<Button class="cursor-pointer" size="xs" color="red" onclick={() => removeNearestGroup(index)} type="button">
										<TrashBinOutline class="w-4 h-4" />
									</Button>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</div>

		<!-- Submit Button -->
		<div class="flex justify-end">
			<Button 
				class="cursor-pointer" 
				type="button" 
				color="green" 
				disabled={isLoading || nearestGroups.length === 0 || showModal}
				onclick={() => showModal = true}
			>
				{#if isLoading}
					<Spinner class="mr-3" size="4" color="white" />
					Processing...
				{:else}
					Posting
				{/if}
			</Button>
		</div>
	</form>
</Card>

<!-- Logout Confirmation Modal using Reusable Component -->
<ConfirmationModal
	bind:open={showModal}
	title="Posting Confirmation"
	message="Pastikan data line dan rak pertemanan yang anda input sudah sesuai!"
	confirmText="Yes"
	cancelText="Cancel"
	confirmColor="green"
	loading={isLoading}
	loadingText="Processing..."
	size="xs"
	permanent={true}
	on:confirm={handlePostingConfirm}
	on:cancel={handlePostingCancel}
/>