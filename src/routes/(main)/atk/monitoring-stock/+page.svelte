<script lang="ts">
	import {
		Card,
		Heading,
		Button,
		Badge,
		Spinner,
		Search,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from 'flowbite-svelte';
	import {
		SearchOutline,
		ArrowsRepeatOutline,
		GoToPrevCellOutline,
		GoToNextCellOutline,
		DatabaseOutline,
		ExclamationCircleOutline,
		MergeCellsOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		FileChartBarOutline
	} from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { deserialize } from '$app/forms';
	import * as XLSX from 'xlsx';

	export let data;

	// ─── Status hanya dua kondisi ────────────────────────────
	// in_stock     → stok > 0  → badge hijau
	// out_of_stock → stok = 0  → badge merah
	const STATUS_CONFIG: Record<string, { color: 'green' | 'red'; label: string }> = {
		in_stock: { color: 'green', label: 'Tersedia' },
		out_of_stock: { color: 'red', label: 'Habis' }
	};

	// ─── Filter state ────────────────────────────────────────
	let searchValue = data.filters.search;
	let isNavigating = false;
	let isExporting = false;
	let exportError: string | null = null;

	// ─── Format helpers ──────────────────────────────────────
	function formatNumber(value: number | null): string {
		if (value == null) return '-';
		return new Intl.NumberFormat('id-ID').format(value);
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	// ─── Variance styling ────────────────────────────────────
	// Positif  = plano > stok → kelebihan slot planogram → biru
	// Negatif  = stok > plano → stok melebihi slot       → merah
	// Nol      = sesuai                                   → hijau
	// null     = belum ada plano                          → abu-abu
	function varianceClass(variance: number | null): string {
		if (variance == null) return 'text-gray-400 dark:text-gray-500';
		if (variance > 0) return 'text-blue-600 dark:text-blue-400';
		if (variance < 0) return 'text-red-600 dark:text-red-400';
		return 'text-green-600 dark:text-green-400';
	}

	function varianceLabel(variance: number | null): string {
		if (variance == null) return '-';
		if (variance > 0) return `+${formatNumber(variance)}`;
		return formatNumber(variance);
	}

	// ─── Navigasi ────────────────────────────────────────────
	async function applyFilter() {
		isNavigating = true;
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		params.set('page', '1');
		await goto(`?${params.toString()}`, { invalidateAll: true });
		isNavigating = false;
	}

	async function resetFilter() {
		searchValue = '';
		isNavigating = true;
		await goto('?', { invalidateAll: true });
		isNavigating = false;
	}

	function onSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') applyFilter();
	}

	async function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', String(p));
		await goto(`?${params.toString()}`, { invalidateAll: true });
	}

	$: paginationRange = (() => {
		const { page: cur, totalPages } = data.pagination;
		const start = Math.max(1, cur - 2);
		const end = Math.min(totalPages, start + 4);
		const pages: number[] = [];
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	})();

	// ─── Export Excel ─────────────────────────────────────────
	async function exportToExcel() {
		exportError = null;
		isExporting = true;
		try {
			// Panggil server action via fetch
			const formData = new FormData();
			if (searchValue) formData.set('search', searchValue);

			const res = await fetch('?/exportStocks', {
				method: 'POST',
				body: formData,
				headers: {
					'x-sveltekit-action': 'true',
					'accept': 'application/json'
				}
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const text = await res.text();
			let stockRows: any[] = [];
			try {
				const result = deserialize(text);
				if (result.type === 'success') {
					stockRows = result.data?.data ?? [];
				} else if (result.type === 'failure') {
					throw new Error(result.data?.error ?? 'Gagal mengambil data dari server');
				} else {
					throw new Error(`Unexpected result type: ${result.type}`);
				}
			} catch (err: any) {
				throw new Error(err.message ?? 'Gagal mem-parsing data export dari server.');
			}

			if (!Array.isArray(stockRows)) stockRows = [];

			// Bentuk baris Excel
			const STATUS_LABEL: Record<string, string> = {
				in_stock: 'Tersedia',
				out_of_stock: 'Habis'
			};

			const wsData = [
				// Header row
				['Kode Produk', 'Nama Produk', 'Singkatan', 'Kemasan', 'Frac',
				 'Qty Stok', 'Qty Plano', 'Variance', 'Status', 'Update Plano'],
				// Data rows
				...stockRows.map((s: any) => [
					s.sku ?? '',
					s.name ?? '',
					s.shortName ?? '',
					s.kemasan ?? '',
					s.frac ?? 0,
					s.quantity ?? 0,
					s.plano ?? '',
					s.variance ?? '',
					STATUS_LABEL[s.status] ?? s.status ?? '',
					s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
				])
			];

			const wb = XLSX.utils.book_new();
			const ws = XLSX.utils.aoa_to_sheet(wsData);

			// Lebar kolom otomatis
			ws['!cols'] = [
				{ wch: 14 }, // Kode
				{ wch: 40 }, // Nama
				{ wch: 20 }, // Singkatan
				{ wch: 12 }, // Kemasan
				{ wch: 8 },  // Frac
				{ wch: 12 }, // Qty Stok
				{ wch: 12 }, // Qty Plano
				{ wch: 12 }, // Variance
				{ wch: 12 }, // Status
				{ wch: 16 }  // Update Plano
			];

			XLSX.utils.book_append_sheet(wb, ws, 'Monitoring Stok');

			// Buat nama file dengan tanggal
			const now = new Date();
			const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
			const filename = `monitoring-stok-atk_${dateStr}.xlsx`;

			XLSX.writeFile(wb, filename);
		} catch (err: any) {
			exportError = err?.message ?? 'Gagal mengekspor data.';
		} finally {
			isExporting = false;
		}
	}
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<!-- ── Header ──────────────────────────────────────────── -->
	<div class="mb-6">
		<Heading tag="h3" class="text-xl font-semibold dark:text-white mb-1">
			Monitoring Stok ATK
		</Heading>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			Pantau ketersediaan stok dan kapasitas planogram secara real-time
		</p>
	</div>

	<!-- ── Summary Cards ───────────────────────────────────── -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
		<div
			class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
		>
			<div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
				<DatabaseOutline class="w-5 h-5 text-blue-600 dark:text-blue-300" />
			</div>
			<div class="min-w-0">
				<p class="text-xs text-gray-500 dark:text-gray-400">Total Item</p>
				<p class="text-xl font-bold text-gray-900 dark:text-white">
					{formatNumber(data.summary.totalItems)}
				</p>
			</div>
		</div>

		<div
			class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
		>
			<div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
				<GoToPrevCellOutline class="w-5 h-5 text-green-600 dark:text-green-300" />
			</div>
			<div class="min-w-0">
				<p class="text-xs text-gray-500 dark:text-gray-400">Total Qty Stok</p>
				<p class="text-xl font-bold text-gray-900 dark:text-white">
					{formatNumber(data.summary.totalStock)}
				</p>
			</div>
		</div>

		<div
			class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
		>
			<div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
				<GoToNextCellOutline class="w-5 h-5 text-purple-600 dark:text-purple-300" />
			</div>
			<div class="min-w-0">
				<p class="text-xs text-gray-500 dark:text-gray-400">Total Qty Plano</p>
				<p class="text-xl font-bold text-gray-900 dark:text-white">
					{formatNumber(data.summary.totalPlano)}
				</p>
			</div>
		</div>

		<div
			class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
		>
			<div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
				<MergeCellsOutline class="w-5 h-5 text-orange-600 dark:text-orange-300" />
			</div>
			<div class="min-w-0">
				<p class="text-xs text-gray-500 dark:text-gray-400">Total Qty Variance</p>
				<p
					class="text-xl font-bold {data.summary.totalVariance > 0
						? 'text-blue-600 dark:text-blue-400'
						: data.summary.totalVariance < 0
							? 'text-red-600 dark:text-red-400'
							: 'text-green-600 dark:text-green-400'}"
				>
					{data.summary.totalVariance > 0 ? '+' : ''}{formatNumber(data.summary.totalVariance)}
				</p>
			</div>
		</div>
	</div>

	<!-- ── Error dari load() ────────────────────────────────── -->
	{#if data.error}
		<div
			class="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm"
		>
			<ExclamationCircleOutline class="w-4 h-4 flex-shrink-0" />
			{data.error}
		</div>
	{/if}

	<!-- ── Search Bar ────────────────────────────────────────── -->
	<div class="flex flex-col sm:flex-row gap-3 mb-4">
		<div class="flex-1">
			<Search
				bind:value={searchValue}
				placeholder="Cari kode produk, nama, atau singkatan..."
				onkeydown={onSearchKeydown}
				size="md"
			/>
		</div>
		<div class="flex gap-2">
			<Button color="blue" size="md" onclick={applyFilter} disabled={isNavigating}>
				{#if isNavigating}
					<Spinner size="4" color="white" class="me-1" />
				{:else}
					<SearchOutline class="w-4 h-4 me-1" />
				{/if}
				Cari
			</Button>
			<Button color="light" size="md" onclick={resetFilter} disabled={isNavigating || isExporting}>
				<ArrowsRepeatOutline class="w-4 h-4 me-1" />
				Reset
			</Button>
			<Button color="green" size="md" onclick={exportToExcel} disabled={isExporting || isNavigating}>
				{#if isExporting}
					<Spinner size="4" color="white" class="me-1" />
					Mengekspor...
				{:else}
					<FileChartBarOutline class="w-4 h-4 me-1" />
					Export Excel
				{/if}
			</Button>
		</div>
	</div>

	<!-- Export error -->
	{#if exportError}
		<div
			class="mb-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm"
		>
			<ExclamationCircleOutline class="w-4 h-4 flex-shrink-0" />
			{exportError}
		</div>
	{/if}

	<!-- Filter aktif -->
	{#if data.filters.search}
		<div class="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
			<span>Filter aktif:</span>
			<Badge color="blue">Kata kunci: "{data.filters.search}"</Badge>
			<span>— {formatNumber(data.pagination.total)} hasil ditemukan</span>
		</div>
	{/if}

	<!-- ── Tabel Stok ────────────────────────────────────────── -->
	<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
		<Table hoverable={true}>
			<TableHead>
				<TableHeadCell>Kode</TableHeadCell>
				<TableHeadCell>Nama Produk</TableHeadCell>
				<TableHeadCell>Kemasan</TableHeadCell>
				<TableHeadCell>Frac</TableHeadCell>
				<TableHeadCell class="text-right">Qty Stok</TableHeadCell>
				<TableHeadCell class="text-right">Qty Plano</TableHeadCell>
				<TableHeadCell class="text-right">Variance</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell>Update Plano</TableHeadCell>
			</TableHead>

			<TableBody>
				{#if data.stocks.length === 0}
					<TableBodyRow>
						<TableBodyCell colspan={9}>
							<div
								class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500"
							>
								<ExclamationCircleOutline class="w-12 h-12 mb-3 opacity-40" />
								<p class="font-medium">Tidak ada data stok</p>
								<p class="text-sm mt-1">
									{data.filters.search
										? 'Coba ubah kata kunci pencarian'
										: 'Belum ada data stok tersedia'}
								</p>
							</div>
						</TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each data.stocks as stock}
						{@const statusCfg = STATUS_CONFIG[stock.status] ?? STATUS_CONFIG.in_stock}
						<TableBodyRow>
							<TableBodyCell
								class="font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
							>
								{stock.sku}
							</TableBodyCell>

							<TableBodyCell class="max-w-xs">
								<div class="font-medium text-gray-900 dark:text-white line-clamp-2">
									{stock.name}
								</div>
								{#if stock.shortName && stock.shortName !== stock.name}
									<div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
										{stock.shortName}
									</div>
								{/if}
							</TableBodyCell>

							<TableBodyCell>
								<Badge color="indigo" class="whitespace-nowrap text-xs">
									{stock.kemasan ?? '-'}
								</Badge>
							</TableBodyCell>

							<!-- Frac — ditampilkan apa adanya sebagai data produk -->
							<TableBodyCell class="text-sm text-gray-500 dark:text-gray-400 text-center">
								{formatNumber(stock.frac)}
							</TableBodyCell>

							<!-- Qty Stok — merah jika habis -->
							<TableBodyCell class="text-right font-semibold whitespace-nowrap">
								<span
									class={stock.status === 'out_of_stock'
										? 'text-red-600 dark:text-red-400'
										: 'text-gray-900 dark:text-white'}
								>
									{formatNumber(stock.quantity)}
								</span>
							</TableBodyCell>

							<!-- Total Plano -->
							<TableBodyCell class="text-right font-medium whitespace-nowrap">
								{#if stock.plano != null}
									<span class="text-purple-600 dark:text-purple-400">
										{formatNumber(stock.plano)}
									</span>
								{:else}
									<span class="text-gray-400 dark:text-gray-500 text-xs italic">—</span>
								{/if}
							</TableBodyCell>

							<!-- Variance -->
							<TableBodyCell
								class="text-right font-medium whitespace-nowrap {varianceClass(stock.variance)}"
							>
								{varianceLabel(stock.variance)}
							</TableBodyCell>

							<!-- Status -->
							<TableBodyCell>
								<Badge color={statusCfg.color} class="whitespace-nowrap">
									{statusCfg.label}
								</Badge>
							</TableBodyCell>

							<!-- Update Plano -->
							<TableBodyCell class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
								{formatDate(stock.lastUpdated)}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>

	<!-- ── Pagination ────────────────────────────────────────── -->
	{#if data.pagination.totalPages > 1}
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Menampilkan
				<span class="font-medium text-gray-700 dark:text-gray-300">
					{(data.pagination.page - 1) * data.pagination.limit + 1}–{Math.min(
						data.pagination.page * data.pagination.limit,
						data.pagination.total
					)}
				</span>
				dari
				<span class="font-medium text-gray-700 dark:text-gray-300">
					{formatNumber(data.pagination.total)}
				</span>
				data
			</p>

			<div class="flex items-center gap-1">
				<Button
					size="sm"
					color="light"
					disabled={data.pagination.page <= 1}
					onclick={() => goToPage(data.pagination.page - 1)}
					class="px-2"
				>
					<ChevronLeftOutline class="w-4 h-4" />
				</Button>

				{#each paginationRange as p}
					<Button
						size="sm"
						color={p === data.pagination.page ? 'blue' : 'light'}
						onclick={() => goToPage(p)}
						class="min-w-[2rem]"
					>
						{p}
					</Button>
				{/each}

				<Button
					size="sm"
					color="light"
					disabled={data.pagination.page >= data.pagination.totalPages}
					onclick={() => goToPage(data.pagination.page + 1)}
					class="px-2"
				>
					<ChevronRightOutline class="w-4 h-4" />
				</Button>
			</div>
		</div>
	{/if}
</Card>
