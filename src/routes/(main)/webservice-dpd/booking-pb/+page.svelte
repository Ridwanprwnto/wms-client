<script>
	import {
		Card,
		Heading,
		Label,
		Input,
		Button,
		Modal,
		Spinner,
		Hr,
		Datepicker
	} from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	import {
		showSuccess,
		showError,
		showWarning,
		showInfo,
		handleApiResponse
	} from '$lib/utils/alertUtils.js';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';

	// State variables
	let tglSplit = '';
	let selectedDate = null;

	let noPick = '';
	let pluId = '';

	// Data Tabel Booking Split PB
	let seqNoSplit = '';
	let storeSplit = '';
	let lineSplit = '';
	let ipDPDSplit = '';
	let idDPDSplit = '';

	let counter = 0;
	let showModal = false;
	let isLoading = false;
	let isLoadingData = false;
	let isAddingRow = false;

	/**
	 * Load booking split PB data menggunakan form action
	 */
	async function loadDataSplitPB() {
		if (!tglSplit || !noPick || !pluId) {
			clearDataSplitPB();
			return;
		}

		isLoadingData = true;

		try {
			const formData = new FormData();
			formData.append('date', tglSplit);
			formData.append('nopick', noPick);
			formData.append('pluid', pluId);

			const response = await fetch('?/getTableSplitPB', {
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
				const apiData = parsedData[4];

				const resolve = (val) => (typeof val === 'number' ? parsedData[val] : val || '');

				seqNoSplit = resolve(apiData.PN_SEQ_FK_NO);
				storeSplit = resolve(apiData.Toko);
				lineSplit = resolve(apiData.Line);
				ipDPDSplit = resolve(apiData.PN_IP_DPD);
				idDPDSplit = resolve(apiData.PN_ID_DPD);

				if (storeSplit) {
					showInfo('Data Booking PB berhasil dimuat');
				} else {
					showWarning('Data tidak ditemukan');
				}
			} else {
				clearDataSplitPB();
				showWarning(result.data?.error || 'Data tidak ditemukan');
			}
		} catch (error) {
			console.error('Error loading booking split PB data:', error);
			clearDataSplitPB();
			showError('Gagal memuat data: ' + error.message);
		} finally {
			isLoadingData = false;
		}
	}

	$: if (selectedDate) {
		try {
			if (typeof selectedDate === 'string') {
				tglSplit = selectedDate;
			} else if (selectedDate instanceof Date) {
				const year = selectedDate.getFullYear();
				const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
				const day = String(selectedDate.getDate()).padStart(2, '0');
				tglSplit = `${year}-${month}-${day}`;
			} else {
				tglSplit = '';
			}
		} catch {
			tglSplit = '';
		}
		loadDataSplitPB();
	}

	/**
	 * Clear semua field split PB data
	 */
	function clearDataSplitPB() {
		storeSplit = '';
		lineSplit = '';
		ipDPDSplit = '';
		idDPDSplit = '';
	}

	/**
	 * Reset form ke kondisi awal
	 */
	function resetForm() {
		selectedDate = null;
		tglSplit = '';
		pluId = '';
		noPick = '';
		clearDataSplitPB();
	}

	/**
	 * Debounce untuk input PLUID
	 */
	let debounceTimer;
	function debouncedLoadData() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(loadDataSplitPB, 500);
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
			Booking Split PB Toko
		</Heading>
	</div>

	<form method="POST" action="?/submit" on:submit|preventDefault={() => (showModal = true)}>
		<!-- Hidden inputs untuk form data -->
		<input type="text" name="tglSplit" value={tglSplit} readonly hidden />
		<input type="text" name="seqNoSplit" value={seqNoSplit} readonly hidden />
		<input type="text" name="pluId" value={pluId} readonly hidden />
		<input type="text" name="storeSplit" value={storeSplit} readonly hidden />
		<input type="text" name="lineSplit" value={lineSplit} readonly hidden />
		<input type="text" name="ipDPDSplit" value={ipDPDSplit} readonly hidden />
		<input type="text" name="idDPDSplit" value={idDPDSplit} readonly hidden />

		<!-- Data Item Section -->
		<div class="mb-6">
			<Heading
				tag="h4"
				class="mb-4 flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300"
			>
				<span></span> Data Split PB
			</Heading>
			<Hr />
			<div class="grid gap-4">
				<div>
					<Label for="date-split" class="mb-2">Tanggal Split</Label>
					<Datepicker id="date-split" bind:value={selectedDate} required />
				</div>
				<div>
					<Label for="picno-split" class="mb-2">Nomor Pick</Label>
					<Input
						id="picno-split"
						type="text"
						placeholder="Enter Pick Number"
						bind:value={noPick}
						oninput={debouncedLoadData}
						required
					/>
					{#if isLoadingData}
						<div class="absolute right-3 top-10">
							<Spinner size="4" />
						</div>
					{/if}
				</div>
				<div>
					<Label for="pluid-split" class="mb-2">PLUID</Label>
					<Input
						id="pluid-split"
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
			<Heading
				tag="h4"
				class="mb-4 flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300"
			>
				<span></span> Data Split Tabel Picking
			</Heading>
			<Hr />
			<div class="grid gap-4 mb-4">
				<div>
					<Label for="store-split" class="mb-2">Store</Label>
					<Input id="store-split" type="text" bind:value={storeSplit} readonly />
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div>
					<Label for="line-split" class="mb-2">Line (Zona + Station)</Label>
					<Input id="line-split" type="text" bind:value={lineSplit} required />
				</div>
				<div>
					<Label for="ipdpd-split" class="mb-2">IP DPD</Label>
					<Input id="ip-split" type="text" bind:value={ipDPDSplit} required />
				</div>
				<div>
					<Label for="iddpd-split" class="mb-2">ID DPD</Label>
					<Input id="iddpd-split" type="text" bind:value={idDPDSplit} required />
				</div>
			</div>
		</div>

		<!-- Submit Button -->
		<div class="flex justify-end">
			<Button
				class="cursor-pointer"
				type="button"
				color="green"
				disabled={isLoading || storeSplit.length === 0 || showModal}
				onclick={() => (showModal = true)}
			>
				{#if isLoading}
					<Spinner class="mr-3" size="4" color="white" />
					Processing...
				{:else}
					Update
				{/if}
			</Button>
		</div>
	</form>
</Card>

<!-- Logout Confirmation Modal using Reusable Component -->
<ConfirmationModal
	bind:open={showModal}
	title="Update Confirmation"
	message="Pastikan data line, IP DPD, dan ID DPD yang anda input sudah sesuai!"
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
