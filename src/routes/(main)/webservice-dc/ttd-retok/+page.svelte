<script>
	import { Card, Heading, Label, Input, Button, Badge, Spinner, Hr } from 'flowbite-svelte';
	import {
		SearchOutline,
		ArrowsRepeatOutline,
		ExclamationCircleOutline,
		CheckCircleOutline,
		ClockOutline,
		ClipboardListOutline,
		FileCheckOutline,
		TruckOutline,
		UserOutline
	} from 'flowbite-svelte-icons';
	import { deserialize } from '$app/forms';
	import { showSuccess, showWarning, showError } from '$lib/utils/alertUtils.js';

	// ─── State ───────────────────────────────────────────────
	let nrb = '';
	let tgl = '';
	let store = '';
	let isLoading = false;
	let hasSearched = false;
	let record = null;
	let errorMessage = '';

	// ─── Format helpers ──────────────────────────────────────
	function formatText(value) {
		if (value === null || value === undefined || value === '') return '-';
		return String(value);
	}

	function formatNumber(value) {
		if (value === null || value === undefined || value === '') return '-';
		const num = Number(value);
		if (Number.isNaN(num)) return String(value);
		return new Intl.NumberFormat('id-ID').format(num);
	}

	function formatDate(value) {
		if (value === null || value === undefined || value === '') return '-';

		const str = String(value);

		// Tanggal murni (YYYY-MM-DD) diparse manual agar tidak bergeser karena timezone.
		const isoDate = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (isoDate) {
			const [, year, month, day] = isoDate;
			const date = new Date(Number(year), Number(month) - 1, Number(day));
			if (!Number.isNaN(date.getTime())) {
				return date.toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				});
			}
		}

		// Kolom tanggal dari database berformat MM/DD/YYYY.
		const mdyDate = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
		if (mdyDate) {
			const [, month, day, year] = mdyDate;
			const date = new Date(Number(year), Number(month) - 1, Number(day));
			if (!Number.isNaN(date.getTime())) {
				return date.toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				});
			}
		}

		const date = new Date(str);
		if (Number.isNaN(date.getTime())) return str;

		return date.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	}

	// ─── Flag helpers ────────────────────────────────────────
	const TRUE_VALUES = ['y', 'ya', '1', 'true', 't', 'sudah', 'checked', 'check', 'ok'];
	const FALSE_VALUES = ['n', 'tidak', '0', 'false', 'f', 'belum', 'unchecked'];

	/**
	 * @param {unknown} value
	 * @returns {boolean | null} null jika nilai tidak dikenali
	 */
	function flagState(value) {
		if (value === null || value === undefined || value === '') return null;

		const key = String(value).trim().toLowerCase();
		if (TRUE_VALUES.includes(key)) return true;
		if (FALSE_VALUES.includes(key)) return false;
		return null;
	}

	function flagBadgeColor(value) {
		const state = flagState(value);
		if (state === true) return 'green';
		if (state === false) return 'red';
		return 'gray';
	}

	function flagLabel(value) {
		const state = flagState(value);
		if (state === true) return 'Sudah';
		if (state === false) return 'Belum';
		return formatText(value);
	}

	/**
	 * Bandingkan jumlah yang dicek dengan jumlah seharusnya.
	 * @param {unknown} checked
	 * @param {unknown} total
	 * @returns {boolean | null} null jika salah satu bukan angka
	 */
	function compareCount(checked, total) {
		const a = Number(checked);
		const b = Number(total);
		if (Number.isNaN(a) || Number.isNaN(b)) return null;
		return a === b;
	}

	// ─── Data turunan ────────────────────────────────────────
	$: statusItems = record
		? [
				{ key: 'absensi', label: 'Flag Absensi', type: 'flag', value: record.attendanceFlag },
				{
					key: 'koli',
					label: 'Cek Koli',
					type: 'count',
					value: record.koliChecked,
					total: record.totalKoli,
					unit: 'koli'
				},
				{
					key: 'cont',
					label: 'Cek Container',
					type: 'count',
					value: record.containerChecked,
					total: record.totalContainer,
					unit: 'container'
				}
			]
		: [];

	$: summaryItems = record
		? [
				{ label: 'Total Rec', value: record.totalRec },
				{ label: 'Total Item Retur', value: record.totalItemRetur },
				{ label: 'Jumlah Koli', value: record.totalKoli },
				{ label: 'Jumlah Container', value: record.totalContainer }
			]
		: [];

	$: sections = record
		? [
				{
					title: 'Identitas TTD & NRB',
					icon: ClipboardListOutline,
					accent: 'bg-blue-500',
					iconColor: 'text-blue-600 dark:text-blue-400',
					fields: [
						{ label: 'Toko / Shop', value: formatText(record.store) },
						{ label: 'No. TTD', value: formatText(record.ttdNumber) },
						{ label: 'Tanggal TTD', value: formatDate(record.ttdDate) },
						{ label: 'No. NRB', value: formatText(record.nrb) },
						{ label: 'Tanggal NRB', value: formatDate(record.nrbDate) },
						{ label: 'Barcode NRB', value: formatText(record.nrbBarcode) }
					]
				},
				{
					title: 'Penerimaan Retur',
					icon: FileCheckOutline,
					accent: 'bg-green-500',
					iconColor: 'text-green-600 dark:text-green-400',
					fields: [
						{ label: 'Tanggal Terima', value: formatDate(record.receivedDate) },
						{ label: 'Total Rec', value: formatNumber(record.totalRec) },
						{ label: 'Total Item Retur', value: formatNumber(record.totalItemRetur) },
						{ label: 'Jumlah Koli', value: formatNumber(record.totalKoli) },
						{ label: 'Jumlah Container', value: formatNumber(record.totalContainer) }
					]
				},
				{
					title: 'Pengiriman (Surat Jalan)',
					icon: TruckOutline,
					accent: 'bg-purple-500',
					iconColor: 'text-purple-600 dark:text-purple-400',
					fields: [
						{ label: 'No. Delivery Van', value: formatText(record.deliveryVan) },
						{ label: 'No. Surat Jalan', value: formatText(record.sjNumber) },
						{ label: 'Tanggal Surat Jalan', value: formatDate(record.sjDate) },
						{ label: 'NIK Driver', value: formatText(record.driverNik) },
						{ label: 'Nama Driver', value: formatText(record.driverName) }
					]
				},
				{
					title: 'Pengecekan',
					icon: UserOutline,
					accent: 'bg-orange-500',
					iconColor: 'text-orange-600 dark:text-orange-400',
					fields: [
						{ label: 'Flag Absensi', value: flagLabel(record.attendanceFlag) },
						{
							label: 'Cek Koli',
							value: `${formatNumber(record.koliChecked)} dari ${formatNumber(record.totalKoli)} koli`
						},
						{
							label: 'Cek Container',
							value: `${formatNumber(record.containerChecked)} dari ${formatNumber(record.totalContainer)} container`
						},
						{ label: 'User Checker', value: formatText(record.checkerUser) },
						{ label: 'NIK Checker', value: formatText(record.checkerNik) }
					]
				}
			]
		: [];

	// ─── Actions ─────────────────────────────────────────────
	async function handleCheck() {
		const trimmedNrb = nrb.trim();
		const trimmedStore = store.trim();

		if (!trimmedNrb || !tgl || !trimmedStore) {
			showWarning('Toko, No. NRB, dan Tanggal NRB wajib diisi');
			return;
		}

		if (!/^\d+$/.test(trimmedNrb)) {
			showWarning('No. NRB harus berupa angka');
			return;
		}

		if (isLoading) return;

		isLoading = true;
		hasSearched = false;
		errorMessage = '';
		record = null;

		try {
			const formData = new FormData();
			formData.append('nrb', trimmedNrb);
			formData.append('tgl', tgl);
			formData.append('store', trimmedStore);

			const response = await fetch('?/checkTTD', {
				method: 'POST',
				body: formData
			});

			// Response action SvelteKit diserialisasi dengan devalue, bukan JSON biasa.
			const result = deserialize(await response.text());

			if (result.type === 'success') {
				record = result.data?.data ?? null;
				hasSearched = true;

				if (record) {
					showSuccess('Data TTD retur toko berhasil ditemukan');
				} else {
					errorMessage = 'Data TTD retur toko tidak ditemukan';
					showWarning(errorMessage);
				}
			} else {
				hasSearched = true;
				errorMessage =
					result.data?.error || result.data?.message || 'Data TTD retur toko tidak ditemukan';
				showWarning(errorMessage);
			}
		} catch (err) {
			hasSearched = true;
			errorMessage = `Gagal mengambil data: ${err?.message ?? 'kesalahan tidak diketahui'}`;
			showError(errorMessage);
		} finally {
			isLoading = false;
		}
	}

	function resetForm() {
		nrb = '';
		tgl = '';
		store = '';
		record = null;
		hasSearched = false;
		errorMessage = '';
	}

	function handleSubmit(event) {
		event.preventDefault();
		handleCheck();
	}
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<!-- ── Header ──────────────────────────────────────────── -->
	<div class="mb-5 flex items-start gap-3">
		<div
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900"
		>
			<FileCheckOutline class="h-6 w-6 text-blue-600 dark:text-blue-300" />
		</div>
		<div>
			<Heading tag="h3" class="mb-1 text-xl font-semibold dark:text-white"
				>Pengecekan Data TTD Retur Toko</Heading
			>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Cek kelengkapan tanda terima dokumen retur toko berdasarkan Toko, No. NRB, dan tanggal NRB.
			</p>
		</div>
	</div>

	<Hr class="mb-5" />

	<!-- ── Form Pencarian ─────────────────────────────────── -->
	<form onsubmit={handleSubmit} class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<Label for="store" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
					Toko / Shop <span class="text-red-500">*</span>
				</Label>
				<Input
					id="store"
					bind:value={store}
					placeholder="Masukkan kode toko"
					autocomplete="off"
					disabled={isLoading}
				/>
			</div>

			<div>
				<Label for="nrb" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
					No. NRB <span class="text-red-500">*</span>
				</Label>
				<Input
					id="nrb"
					bind:value={nrb}
					placeholder="Masukkan nomor NRB"
					autocomplete="off"
					disabled={isLoading}
				/>
			</div>

			<div>
				<Label for="tgl" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
					Tanggal NRB <span class="text-red-500">*</span>
				</Label>
				<Input id="tgl" type="date" bind:value={tgl} disabled={isLoading} />
			</div>
		</div>

		<div class="mt-4 flex flex-wrap justify-end gap-3">
			<Button
				type="button"
				color="light"
				onclick={resetForm}
				disabled={isLoading}
				class="cursor-pointer"
			>
				<ArrowsRepeatOutline class="me-2 h-4 w-4" />
				Reset
			</Button>
			<Button type="submit" color="blue" disabled={isLoading} class="cursor-pointer">
				{#if isLoading}
					<Spinner size="4" color="white" class="me-2" />
					Mencari...
				{:else}
					<SearchOutline class="me-2 h-4 w-4" />
					Cek Data
				{/if}
			</Button>
		</div>
	</form>

	<!-- ── State: Loading ─────────────────────────────────── -->
	{#if isLoading}
		<div class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
			<Spinner size="8" />
			<p class="mt-3 text-sm">Mengambil data TTD retur toko...</p>
		</div>

		<!-- ── State: Hasil ditemukan ─────────────────────── -->
	{:else if record}
		<div class="mt-6">
			<div class="mb-4 flex flex-wrap items-center gap-2">
				<CheckCircleOutline class="h-5 w-5 text-green-600 dark:text-green-400" />
				<h4 class="text-lg font-semibold text-gray-900 dark:text-white">Hasil Pengecekan</h4>
				<Badge color="green">Ditemukan</Badge>
				<span class="text-sm text-gray-500 dark:text-gray-400">
					NRB {formatText(record.nrb)} &middot; Toko {formatText(record.store)}
				</span>
			</div>

			<!-- Status pengecekan -->
			<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
				{#each statusItems as item (item.key)}
					<div
						class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<p
							class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
						>
							{item.label}
						</p>

						{#if item.type === 'flag'}
							<Badge color={flagBadgeColor(item.value)} large class="inline-flex items-center">
								{#if flagState(item.value) === true}
									<CheckCircleOutline class="me-1 h-3.5 w-3.5" />
								{:else if flagState(item.value) === false}
									<ExclamationCircleOutline class="me-1 h-3.5 w-3.5" />
								{:else}
									<ClockOutline class="me-1 h-3.5 w-3.5" />
								{/if}
								{flagLabel(item.value)}
							</Badge>
						{:else}
							<div class="flex items-baseline gap-2">
								<p class="text-2xl font-bold text-gray-900 dark:text-white">
									{formatNumber(item.value)}
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									dari {formatNumber(item.total)}
									{item.unit}
								</p>
							</div>
							{#if compareCount(item.value, item.total) === true}
								<Badge color="green" class="mt-2 inline-flex items-center">
									<CheckCircleOutline class="me-1 h-3 w-3" />
									Sesuai
								</Badge>
							{:else if compareCount(item.value, item.total) === false}
								<Badge color="orange" class="mt-2 inline-flex items-center">
									<ExclamationCircleOutline class="me-1 h-3 w-3" />
									Berbeda
								</Badge>
							{/if}
						{/if}
					</div>
				{/each}
			</div>

			<!-- Ringkasan angka -->
			<div class="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
				{#each summaryItems as item (item.label)}
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<p class="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
						<p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
							{formatNumber(item.value)}
						</p>
					</div>
				{/each}
			</div>

			<!-- Detail per kelompok -->
			<div class="space-y-4">
				{#each sections as section (section.title)}
					<div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
						<div
							class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
						>
							<span class="h-4 w-1 rounded-full {section.accent}"></span>
							<svelte:component this={section.icon} class="h-4 w-4 {section.iconColor}" />
							<h5 class="text-sm font-semibold text-gray-900 dark:text-white">
								{section.title}
							</h5>
						</div>
						<dl class="grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each section.fields as field (field.label)}
								<div class="min-w-0">
									<dt
										class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
									>
										{field.label}
									</dt>
									<dd class="mt-1 break-words text-sm font-medium text-gray-900 dark:text-white">
										{field.value}
									</dd>
								</div>
							{/each}
						</dl>
					</div>
				{/each}
			</div>
		</div>

		<!-- ── State: Tidak ditemukan ─────────────────────── -->
	{:else if hasSearched}
		<div
			class="mt-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
		>
			<ExclamationCircleOutline class="mt-0.5 h-5 w-5 flex-shrink-0" />
			<div>
				<p class="font-semibold">Data tidak ditemukan</p>
				<p class="mt-1">
					{errorMessage || 'Pastikan No. NRB, tanggal NRB, dan toko sudah benar.'}
				</p>
			</div>
		</div>

		<!-- ── State: Belum ada pencarian ─────────────────── -->
	{:else}
		<div
			class="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-600"
		>
			<SearchOutline class="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
			<p class="font-medium text-gray-600 dark:text-gray-300">Belum ada data yang dicek</p>
			<p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
				Masukkan Toko, No. NRB, dan Tanggal NRB lalu klik <strong>Cek Data</strong>.
			</p>
		</div>
	{/if}
</Card>
