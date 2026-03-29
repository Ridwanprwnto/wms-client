<script lang="ts">
	import {
		Card,
		Heading,
		Tabs,
		TabItem,
		Button,
		Fileupload,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Badge,
		Input
	} from 'flowbite-svelte';
	import { UploadOutline, CheckCircleOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { showSuccess, showError } from '$lib/utils/alertUtils.js';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import { onDestroy } from 'svelte';

	export let data;
	export let form; // hasil dari action (ActionData)

	// ─── Sync info (dari load) ────────────────────────────────────────────────
	// Struktur: { office_sync: string, date_sync: string } | null
	$: syncProduk = data.syncProduk ?? null;
	$: syncSupplier = data.syncSupplier ?? null;
	$: syncStock = data.syncStock ?? null;

	/**
	 * Format ISO date string ke locale Indonesia.
	 * Contoh: "2026-03-25T08:07:15.000Z" → "25 Mar 2026, 15.07 WIB"
	 * @param {string | null | undefined} isoStr
	 */
	function formatSyncDate(isoStr: string | null | undefined): string {
		if (!isoStr) return '-';
		try {
			return new Intl.DateTimeFormat('id-ID', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				timeZone: 'Asia/Jakarta',
				timeZoneName: 'short'
			}).format(new Date(isoStr));
		} catch {
			return isoStr;
		}
	}

	// ─── Types ────────────────────────────────────────────────────────────────
	type UploadTab = 'produk' | 'supplier' | 'stock';

	// ─── Search state ─────────────────────────────────────────────────────────
	let searchQuery: Record<UploadTab, string> = {
		produk: '',
		supplier: '',
		stock: ''
	};

	function handleSearch(tab: UploadTab) {
		visibleCount[tab] = PAGE_SIZE;
		observers[tab]?.disconnect();
		observers[tab] = null;
	}

	function clearSearch(tab: UploadTab) {
		searchQuery[tab] = '';
		visibleCount[tab] = PAGE_SIZE;
		observers[tab]?.disconnect();
		observers[tab] = null;
	}

	// ─── Filter helpers ───────────────────────────────────────────────────────
	function normalize(s: unknown): string {
		return String(s ?? '').toLowerCase();
	}

	$: filteredProduk = (() => {
		const q = searchQuery.produk.toLowerCase().trim();
		if (!q) return data.produk ?? [];
		return (data.produk ?? []).filter(
			(r) =>
				normalize(r.prdcd).includes(q) ||
				normalize(r.nama).includes(q) ||
				normalize(r.cat_cod).includes(q) ||
				normalize(r.kemasan).includes(q) ||
				normalize(r.prd_size).includes(q) ||
				normalize(r.unit).includes(q) ||
				normalize(r.supco).includes(q) ||
				normalize(r.ptag).includes(q)
		);
	})();

	$: filteredSupplier = (() => {
		const q = searchQuery.supplier.toLowerCase().trim();
		if (!q) return data.supplier ?? [];
		return (data.supplier ?? []).filter(
			(r) =>
				normalize(r.supco).includes(q) ||
				normalize(r.snama).includes(q) ||
				normalize(r.salm).includes(q) ||
				normalize(r.skota).includes(q)
		);
	})();

	$: filteredStock = (() => {
		const q = searchQuery.stock.toLowerCase().trim();
		if (!q) return data.stock ?? [];
		return (data.stock ?? []).filter((r) => normalize(r.prdcd).includes(q));
	})();

	// ─── Lazy-load ────────────────────────────────────────────────────────────
	const PAGE_SIZE = 40;

	let visibleCount: Record<UploadTab, number> = {
		produk: PAGE_SIZE,
		supplier: PAGE_SIZE,
		stock: PAGE_SIZE
	};

	let sentinels: Record<UploadTab, HTMLElement | null> = {
		produk: null,
		supplier: null,
		stock: null
	};

	let observers: Record<UploadTab, IntersectionObserver | null> = {
		produk: null,
		supplier: null,
		stock: null
	};

	$: visibleProduk = filteredProduk.slice(0, visibleCount.produk);
	$: visibleSupplier = filteredSupplier.slice(0, visibleCount.supplier);
	$: visibleStock = filteredStock.slice(0, visibleCount.stock);

	function attachObserver(tab: UploadTab, totalLength: number) {
		observers[tab]?.disconnect();
		const el = sentinels[tab];
		if (!el) return;
		observers[tab] = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visibleCount[tab] = Math.min(visibleCount[tab] + PAGE_SIZE, totalLength);
					if (visibleCount[tab] >= totalLength) observers[tab]?.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		observers[tab].observe(el);
	}

	$: if (sentinels.produk) attachObserver('produk', filteredProduk.length);
	$: if (sentinels.supplier) attachObserver('supplier', filteredSupplier.length);
	$: if (sentinels.stock) attachObserver('stock', filteredStock.length);

	onDestroy(() => Object.values(observers).forEach((o) => o?.disconnect()));

	// ─── Upload state ─────────────────────────────────────────────────────────
	let fileNames: Record<UploadTab, string> = {
		produk: '',
		supplier: '',
		stock: ''
	};
	let hasFile: Record<UploadTab, boolean> = {
		produk: false,
		supplier: false,
		stock: false
	};

	let showModal = false;
	let isLoading = false;
	let pendingTab: UploadTab | null = null;

	let formRefs: Record<UploadTab, HTMLFormElement | null> = {
		produk: null,
		supplier: null,
		stock: null
	};

	function handleFileChange(tab: UploadTab, event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			fileNames[tab] = input.files[0].name;
			hasFile[tab] = true;
		} else {
			fileNames[tab] = '';
			hasFile[tab] = false;
		}
	}

	function triggerUpload(tab: UploadTab) {
		if (!hasFile[tab]) {
			showError('Pilih file CSV terlebih dahulu!');
			return;
		}
		pendingTab = tab;
		showModal = true;
	}

	function handlePostingConfirm() {
		if (!pendingTab || !formRefs[pendingTab]) return;
		showModal = false;
		formRefs[pendingTab]!.requestSubmit();
	}

	function handlePostingCancel() {
		showModal = false;
		pendingTab = null;
	}

	function handleEnhance(tab: UploadTab) {
		isLoading = true;
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			isLoading = false;
			pendingTab = null;

			if (result.type === 'success' && result.data?.success) {
				showSuccess(result.data.message ?? `Data ${tab} berhasil diupload!`);
				fileNames[tab] = '';
				hasFile[tab] = false;
				await invalidateAll();
			} else {
				const msg =
					result.data?.message || result.error?.message || `Gagal mengupload data ${tab}.`;
				showError(msg);
			}
			await update();
		};
	}

	const tabLabels: Record<UploadTab, string> = {
		produk: 'Produk',
		supplier: 'Supplier',
		stock: 'Stock'
	};
</script>

<!-- ─── Komponen badge sync (reusable inline) ─────────────────────────────── -->
<!-- Digunakan di tiap tab untuk menampilkan info sinkronisasi terakhir -->

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<Heading tag="h3" class="mb-4 text-xl font-semibold dark:text-white">Master ATK</Heading>

	<Tabs tabStyle="underline">
		<!-- ═══════════════════════════ TAB PRODUK ═══════════════════════════ -->
		<TabItem open title="Master Produk">
			<form
				method="POST"
				action="?/uploadCsv"
				enctype="multipart/form-data"
				bind:this={formRefs.produk}
				use:enhance={() => handleEnhance('produk')}
			>
				<input type="hidden" name="type" value="produk" />

				<div
					class="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
				>
					<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
						Kolom CSV: <code class="rounded bg-gray-200 px-1 dark:bg-gray-700">
							RECID | WARE_HOUSE | CAT_COD | PRDCD | PRD_MODE | PRD_DESC | SINGKAT | MERK | NAMA |
							FLAVOUR | KEMASAN | PRD_SIZE | PRD_BKP | DESC2 | FRAC | UNIT | ACOST | RCOST | LCOST |
							MARKUP1 | MARKUP2 | MARKUP3 | MARKUP4 | MARKUP5 | MARKUP6 | PRICE_A | PRICE_B |
							PRICE_C | PRICE_D | PRICE_E | PRICE_F | DIV | PRDGRP | CTGR | KONS | SUPCO | SUPCO_1 |
							PTAG | TGL_TAMBAH | TGL_RUBAH | TGL_HARGA1 | TGL_HARGA2 | TGL_HARGA3 | TGL_HARGA4 |
							TGL_HARGA5 | TGL_HARGA6 | REORDER | PRD_LENGTH | WIDTH | HEIGHT | K_LENGTH | K_WIDTH |
							K_HEIGHT | BERAT_SAT | BERAT_KRT | EXP_MONTH | EXP_DAY | UPD_DATE | PRD_ST_BKP
						</code>
					</p>
					<div class="flex flex-wrap items-center gap-3">
						<div class="flex-1 min-w-0">
							<Fileupload
								name="file"
								accept=".csv"
								onchange={(e) => handleFileChange('produk', e)}
							/>
						</div>
						{#if fileNames.produk}
							<Badge color="green" class="flex items-center gap-1 shrink-0">
								<CheckCircleOutline size="sm" />{fileNames.produk}
							</Badge>
						{/if}
						<Button
							color="green"
							type="button"
							disabled={isLoading || !hasFile.produk}
							onclick={() => triggerUpload('produk')}
						>
							{#if isLoading && pendingTab === 'produk'}
								<Spinner class="mr-2" size="4" color="white" />Mengupload...
							{:else}
								<UploadOutline class="mr-2" size="sm" />Upload Produk
							{/if}
						</Button>
					</div>
				</div>
			</form>

			<!-- Search bar + info -->
			<div class="mb-3 flex flex-wrap items-center gap-3">
				<div class="relative flex-1 min-w-[200px]">
					<Input
						type="text"
						placeholder="Cari kode atau nama produk..."
						bind:value={searchQuery.produk}
						oninput={() => handleSearch('produk')}
						class="pl-9 pr-9 text-sm"
					/>
					{#if searchQuery.produk}
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
							onclick={() => clearSearch('produk')}
						>
							<CloseOutline class="h-4 w-4" />
						</button>
					{/if}
				</div>
				<p class="shrink-0 text-xs text-gray-400 dark:text-gray-500">
					{#if searchQuery.produk.trim()}
						<span class="font-medium text-blue-500">{filteredProduk.length}</span> hasil dari {(
							data.produk ?? []
						).length} data
					{:else}
						Menampilkan <span class="font-medium">{visibleProduk.length}</span> dari {(
							data.produk ?? []
						).length} baris
					{/if}
				</p>
			</div>

			<!-- Last Sync badge -->
			<div class="mb-4 flex items-center gap-2">
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-400 dark:text-gray-500"
				>
					Last Sync:&nbsp;
					{#if syncProduk}
						<span class="font-medium text-gray-600 dark:text-gray-300"
							>{formatSyncDate(syncProduk.date_sync)}</span
						>
					{:else}
						<span class="italic">Belum ada data sinkronisasi</span>
					{/if}
				</span>
			</div>

			<!-- Tabel -->
			<div
				class="relative overflow-auto rounded-lg border border-gray-200 dark:border-gray-700"
				style="max-height: 420px;"
			>
				<Table hoverable={true} class="w-full">
					<TableHead class="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Kode Produk</TableHeadCell>
						<TableHeadCell>Nama Produk</TableHeadCell>
						<TableHeadCell>Kategori Kode</TableHeadCell>
						<TableHeadCell>Kemasan</TableHeadCell>
						<TableHeadCell>Size</TableHeadCell>
						<TableHeadCell>Fraction</TableHeadCell>
						<TableHeadCell>Unit</TableHeadCell>
						<TableHeadCell>Acost</TableHeadCell>
						<TableHeadCell>Rcost</TableHeadCell>
						<TableHeadCell>Lcost</TableHeadCell>
						<TableHeadCell>Supco</TableHeadCell>
						<TableHeadCell>PTAG</TableHeadCell>
					</TableHead>
					<TableBody>
						{#if visibleProduk.length > 0}
							{#each visibleProduk as item, i}
								<TableBodyRow>
									<TableBodyCell>{i + 1}</TableBodyCell>
									<TableBodyCell>{item.prdcd}</TableBodyCell>
									<TableBodyCell>{item.nama}</TableBodyCell>
									<TableBodyCell>{item.cat_cod}</TableBodyCell>
									<TableBodyCell>{item.kemasan}</TableBodyCell>
									<TableBodyCell>{item.prd_size}</TableBodyCell>
									<TableBodyCell>{item.frac}</TableBodyCell>
									<TableBodyCell>{item.unit}</TableBodyCell>
									<TableBodyCell>{item.acost}</TableBodyCell>
									<TableBodyCell>{item.rcost}</TableBodyCell>
									<TableBodyCell>{item.lcost}</TableBodyCell>
									<TableBodyCell>{item.supco}</TableBodyCell>
									<TableBodyCell>{item.ptag}</TableBodyCell>
								</TableBodyRow>
							{/each}
						{:else}
							<TableBodyRow>
								<TableBodyCell colspan={13} class="py-10 text-center text-gray-400">
									{searchQuery.produk.trim()
										? `Tidak ada hasil untuk "${searchQuery.produk}"`
										: 'Belum ada data produk.'}
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					</TableBody>
				</Table>
				{#if visibleCount.produk < filteredProduk.length}
					<div
						bind:this={sentinels.produk}
						class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400"
					>
						<Spinner size="4" /><span>Memuat lebih banyak...</span>
					</div>
				{/if}
			</div>
		</TabItem>

		<!-- ══════════════════════════ TAB SUPPLIER ══════════════════════════ -->
		<TabItem title="Master Supplier">
			<form
				method="POST"
				action="?/uploadCsv"
				enctype="multipart/form-data"
				bind:this={formRefs.supplier}
				use:enhance={() => handleEnhance('supplier')}
			>
				<input type="hidden" name="type" value="supplier" />

				<div
					class="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
				>
					<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
						Kolom CSV: <code class="rounded bg-gray-200 px-1 dark:bg-gray-700">
							RECID | SUPCO | SUPCO_1 | SNAMA | SALM | SKOTA | SCP | SDR | TELP_1 | TELP_2 | TELP_3
							| FAX_1 | FAX_2 | FAX_3 | SKTR | BUAT_PO | SCENTRE | SDATANG | JADWAL | DISC | PKP |
							NPWP | SKP | TGLSKP | LEAD | DLVR_RP | DLVR_M3 | UP_DATE | FLAG_TDK_TAXTEMP
						</code>
					</p>
					<div class="flex flex-wrap items-center gap-3">
						<div class="flex-1 min-w-0">
							<Fileupload
								name="file"
								accept=".csv"
								onchange={(e) => handleFileChange('supplier', e)}
							/>
						</div>
						{#if fileNames.supplier}
							<Badge color="green" class="flex items-center gap-1 shrink-0">
								<CheckCircleOutline size="sm" />{fileNames.supplier}
							</Badge>
						{/if}
						<Button
							color="green"
							type="button"
							disabled={isLoading || !hasFile.supplier}
							onclick={() => triggerUpload('supplier')}
						>
							{#if isLoading && pendingTab === 'supplier'}
								<Spinner class="mr-2" size="4" color="white" />Mengupload...
							{:else}
								<UploadOutline class="mr-2" size="sm" />Upload Supplier
							{/if}
						</Button>
					</div>
				</div>
			</form>

			<!-- Search bar + info -->
			<div class="mb-3 flex flex-wrap items-center gap-3">
				<div class="relative flex-1 min-w-[200px]">
					<Input
						type="text"
						placeholder="Cari kode produk, nama, kode/nama supplier..."
						bind:value={searchQuery.supplier}
						oninput={() => handleSearch('supplier')}
						class="pl-9 pr-9 text-sm"
					/>
					{#if searchQuery.supplier}
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
							onclick={() => clearSearch('supplier')}
						>
							<CloseOutline class="h-4 w-4" />
						</button>
					{/if}
				</div>
				<p class="shrink-0 text-xs text-gray-400 dark:text-gray-500">
					{#if searchQuery.supplier.trim()}
						<span class="font-medium text-blue-500">{filteredSupplier.length}</span> hasil dari {(
							data.supplier ?? []
						).length} data
					{:else}
						Menampilkan <span class="font-medium">{visibleSupplier.length}</span> dari {(
							data.supplier ?? []
						).length} baris
					{/if}
				</p>
			</div>

			<!-- Last Sync badge -->
			<div class="mb-4 flex items-center gap-2">
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-400 dark:text-gray-500"
				>
					Last Sync:&nbsp;
					{#if syncSupplier}
						<span class="font-medium text-gray-600 dark:text-gray-300"
							>{formatSyncDate(syncSupplier.date_sync)}</span
						>
					{:else}
						<span class="italic">Belum ada data sinkronisasi</span>
					{/if}
				</span>
			</div>

			<div
				class="relative overflow-auto rounded-lg border border-gray-200 dark:border-gray-700"
				style="max-height: 420px;"
			>
				<Table hoverable={true} class="w-full">
					<TableHead class="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Kode Supplier</TableHeadCell>
						<TableHeadCell>Nama Supplier</TableHeadCell>
						<TableHeadCell>Alamat Supplier</TableHeadCell>
						<TableHeadCell>Kota Supplier</TableHeadCell>
					</TableHead>
					<TableBody>
						{#if visibleSupplier.length > 0}
							{#each visibleSupplier as item, i}
								<TableBodyRow>
									<TableBodyCell>{i + 1}</TableBodyCell>
									<TableBodyCell>{item.supco}</TableBodyCell>
									<TableBodyCell>{item.snama}</TableBodyCell>
									<TableBodyCell>{item.salm}</TableBodyCell>
									<TableBodyCell>{item.skota}</TableBodyCell>
								</TableBodyRow>
							{/each}
						{:else}
							<TableBodyRow>
								<TableBodyCell colspan={5} class="py-10 text-center text-gray-400">
									{searchQuery.supplier.trim()
										? `Tidak ada hasil untuk "${searchQuery.supplier}"`
										: 'Belum ada data supplier.'}
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					</TableBody>
				</Table>
				{#if visibleCount.supplier < filteredSupplier.length}
					<div
						bind:this={sentinels.supplier}
						class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400"
					>
						<Spinner size="4" /><span>Memuat lebih banyak...</span>
					</div>
				{/if}
			</div>
		</TabItem>

		<!-- ══════════════════════════ TAB STOCK ══════════════════════════ -->
		<TabItem title="Master Stock">
			<form
				method="POST"
				action="?/uploadCsv"
				enctype="multipart/form-data"
				bind:this={formRefs.stock}
				use:enhance={() => handleEnhance('stock')}
			>
				<input type="hidden" name="type" value="stock" />

				<div
					class="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
				>
					<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
						Kolom CSV: <code class="rounded bg-gray-200 px-1 dark:bg-gray-700">
							RECID | GUDANG | LOKASI | DIV | KLPT | PRDCD | MAX | MIN | LAST | QTY | BEGBAL | TRFIN
							| TRFOUT | ADJUST | TRFIN_H | TRFOUT_H | ADJUST_H | LCOST | LCOST_H | KONS | DISPID |
							LT | RAK | BAR | CELL | QTY_MAX | LAST_TRANS | KETER
						</code>
					</p>
					<div class="flex flex-wrap items-center gap-3">
						<div class="flex-1 min-w-0">
							<Fileupload
								name="file"
								accept=".csv"
								onchange={(e) => handleFileChange('stock', e)}
							/>
						</div>
						{#if fileNames.stock}
							<Badge color="green" class="flex items-center gap-1 shrink-0">
								<CheckCircleOutline size="sm" />{fileNames.stock}
							</Badge>
						{/if}
						<Button
							color="green"
							type="button"
							disabled={isLoading || !hasFile.stock}
							onclick={() => triggerUpload('stock')}
						>
							{#if isLoading && pendingTab === 'stock'}
								<Spinner class="mr-2" size="4" color="white" />Mengupload...
							{:else}
								<UploadOutline class="mr-2" size="sm" />Upload Stock
							{/if}
						</Button>
					</div>
				</div>
			</form>

			<!-- Search bar + info -->
			<div class="mb-3 flex flex-wrap items-center gap-3">
				<div class="relative flex-1 min-w-[200px]">
					<Input
						type="text"
						placeholder="Cari kode, nama, atau jumlah stock..."
						bind:value={searchQuery.stock}
						oninput={() => handleSearch('stock')}
						class="pl-9 pr-9 text-sm"
					/>
					{#if searchQuery.stock}
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
							onclick={() => clearSearch('stock')}
						>
							<CloseOutline class="h-4 w-4" />
						</button>
					{/if}
				</div>
				<p class="shrink-0 text-xs text-gray-400 dark:text-gray-500">
					{#if searchQuery.stock.trim()}
						<span class="font-medium text-blue-500">{filteredStock.length}</span> hasil dari {(
							data.stock ?? []
						).length} data
					{:else}
						Menampilkan <span class="font-medium">{visibleStock.length}</span> dari {(
							data.stock ?? []
						).length} baris
					{/if}
				</p>
			</div>

			<!-- Last Sync badge -->
			<div class="mb-4 flex items-center gap-2">
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-400 dark:text-gray-500"
				>
					Last Sync:&nbsp;
					{#if syncStock}
						<span class="font-medium text-gray-600 dark:text-gray-300"
							>{formatSyncDate(syncStock.date_sync)}</span
						>
					{:else}
						<span class="italic">Belum ada data sinkronisasi</span>
					{/if}
				</span>
			</div>

			<div
				class="relative overflow-auto rounded-lg border border-gray-200 dark:border-gray-700"
				style="max-height: 420px;"
			>
				<Table hoverable={true} class="w-full">
					<TableHead class="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Kode Produk</TableHeadCell>
						<TableHeadCell>Kelipatan</TableHeadCell>
						<TableHeadCell>Stock</TableHeadCell>
						<TableHeadCell>Last Transaction</TableHeadCell>
					</TableHead>
					<TableBody>
						{#if visibleStock.length > 0}
							{#each visibleStock as item, i}
								<TableBodyRow>
									<TableBodyCell>{i + 1}</TableBodyCell>
									<TableBodyCell>{item.prdcd}</TableBodyCell>
									<TableBodyCell>{item.klpt}</TableBodyCell>
									<TableBodyCell>{item.qty}</TableBodyCell>
									<TableBodyCell>{item.last_trans}</TableBodyCell>
								</TableBodyRow>
							{/each}
						{:else}
							<TableBodyRow>
								<TableBodyCell colspan={5} class="py-10 text-center text-gray-400">
									{searchQuery.stock.trim()
										? `Tidak ada hasil untuk "${searchQuery.stock}"`
										: 'Belum ada data stock.'}
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					</TableBody>
				</Table>
				{#if visibleCount.stock < filteredStock.length}
					<div
						bind:this={sentinels.stock}
						class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400"
					>
						<Spinner size="4" /><span>Memuat lebih banyak...</span>
					</div>
				{/if}
			</div>
		</TabItem>
	</Tabs>
</Card>

<!-- Confirmation Modal -->
<ConfirmationModal
	bind:open={showModal}
	title="Konfirmasi Upload"
	message={`Pastikan format CSV untuk data ${pendingTab ? tabLabels[pendingTab] : ''} sudah sesuai sebelum melanjutkan.`}
	confirmText="Ya, Upload"
	cancelText="Batal"
	confirmColor="green"
	loading={isLoading}
	loadingText="Mengupload..."
	size="xs"
	permanent={true}
	on:confirm={handlePostingConfirm}
	on:cancel={handlePostingCancel}
/>
