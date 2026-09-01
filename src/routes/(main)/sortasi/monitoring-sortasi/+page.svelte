<script lang="ts">
	import {
		Card,
		Heading,
		Progressbar,
		Badge,
		Button,
		Input,
		Label,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search,
		Select,
		Modal,
		Spinner
	} from 'flowbite-svelte';
	import {
		InfoCircleSolid,
		SearchOutline,
		CheckCircleSolid,
		ClockSolid,
		DotsHorizontalOutline,
		ExclamationCircleOutline,
		ArrowsRepeatOutline,
		SortOutline,
		AdjustmentsHorizontalOutline,
		MapPinSolid,
		UserCircleSolid
	} from 'flowbite-svelte-icons';

	export let data;
	$: selectedMethod = data?.selectedMethod || 'all';
	$: monitoringData = data?.monitoringData || [];
	$: console.log('monitoringData:', monitoringData.slice(0,2));
	$: selectedDate = data?.selectedDate || '';

	let inputDate = selectedDate;
	let inputMethod = selectedMethod;
	
	const methodOptions = [
		{ value: 'all', name: 'Semua Metode' },
		{ value: 'scan', name: 'Scan Container' },
		{ value: 'count', name: 'Input Container' }
	];

	// ─── Modal & Details State ───────────────────────────────
	let detailModal = false;
	let selectedProcess = null;
	let containerDetails = [];
	let isLoadingDetails = false;

	async function openDetails(item) {
		selectedProcess = item;
		detailModal = true;
		isLoadingDetails = true;
		containerDetails = [];
		try {
			const res = await fetch(
				`/sortasi/monitoring-sortasi/api?nopick=${encodeURIComponent(item.nopick)}`
			);
			if (!res.ok) throw new Error('Gagal mengambil detail container');
			const json = await res.json();
			if (json && json.data) {
				if (Array.isArray(json.data)) {
					selectedProcess.scan_method = "scan";
					containerDetails = json.data;
				} else {
					selectedProcess.scan_method = json.data.method || "scan";
					containerDetails = json.data.details || [];
					selectedProcess.countLogs = json.data.countLogs || [];
				}
			}
		} catch (error) {
			console.error('Failed to load container details', error);
		} finally {
			isLoadingDetails = false;
		}
	}

	// ─── Client-side Filter State ────────────────────────────
	let searchValue = '';
	let statusFilter = 'all';

	const statusOptions = [
		{ value: 'all', name: 'Semua Status' },
		{ value: 'in_progress', name: 'In Progress' },
		{ value: 'completed', name: 'Completed' },
		{ value: 'pending', name: 'Pending' }
	];

	// ─── Filtered data (reactive) ────────────────────────────
	$: filteredData = monitoringData.filter((item) => {
		const q = searchValue.toLowerCase().trim();
		const matchSearch = q
			? item.nopick?.toLowerCase().includes(q) ||
				item.tokoname?.toLowerCase().includes(q) ||
				item.toko?.toLowerCase().includes(q)
			: true;
		const matchStatus = statusFilter === 'all' ? true : item.status === statusFilter;
		const matchMethod = selectedMethod === 'all' ? true : item.scan_method === selectedMethod;
		return matchSearch && matchStatus && matchMethod;
	});

	// ─── Summary stats ───────────────────────────────────────
	$: totalPick = monitoringData.length;
	$: totalCompleted = monitoringData.filter((i) => i.status === 'completed').length;
	$: totalInProgress = monitoringData.filter((i) => i.status === 'in_progress').length;
	$: totalPending = monitoringData.filter((i) => i.status === 'pending').length;

	function resetFilter() {
		searchValue = '';
		statusFilter = 'all';
	}

	// ─── Helpers ─────────────────────────────────────────────
	function getProgressColor(percentage) {
		if (percentage === 100) return 'green';
		if (percentage >= 50) return 'blue';
		if (percentage > 0) return 'yellow';
		return 'gray';
	}

	function getStatusConfig(status) {
		const s = status?.toLowerCase();
		if (s === 'completed') return { color: 'green', icon: CheckCircleSolid, label: 'Completed' };
		if (s === 'in_progress') return { color: 'blue', icon: ClockSolid, label: 'In Progress' };
		if (s === 'pending') return { color: 'yellow', icon: DotsHorizontalOutline, label: 'Pending' };
		return { color: 'gray', icon: InfoCircleSolid, label: 'Unknown' };
	}

	function getContainerStatusConfig(status) {
		if (status == 1 || status === true || String(status).toLowerCase() === 'true') {
			return { color: 'green', icon: CheckCircleSolid, label: 'Finish' };
		}
		return { color: 'yellow', icon: ClockSolid, label: 'On Proses' };
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<!-- ── Header & Date Filter ─────────────────────────────── -->
	<div class="mb-6">
		<div class="items-center justify-between lg:flex">
			<div class="mb-4 lg:mb-0">
				<Heading tag="h3" class="text-xl font-semibold dark:text-white mb-1">
					Monitoring Sortasi
				</Heading>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Pantau progress penyortiran container barang
				</p>
			</div>
			<form action="" method="GET" class="flex items-center gap-3">
				<div>
					<Label for="date-filter" class="sr-only">Tanggal Pick</Label>
					<Input id="date-filter" name="date" type="date" bind:value={inputDate} size="md" />
				</div>
				<div>
					<Label for="method-filter" class="sr-only">Metode Sortasi</Label>
					<Select id="method-filter" name="method" bind:value={inputMethod} size="md" class="min-w-[160px]" items={methodOptions} />
				</div>
				<Button color="primary" type="submit" disabled={!inputDate}>
					<SearchOutline class="w-4 h-4 me-2" />
					Tampilkan Data
				</Button>
			</form>
		</div>
	</div>

	<!-- ── Content ───────────────────────────────────────────── -->
	{#if !selectedDate}
		<div class="text-center py-16 text-gray-500 dark:text-gray-400">
			<SearchOutline class="mx-auto h-12 w-12 mb-3 opacity-40" />
			<p class="text-base font-medium">Pilih Tanggal Pick</p>
			<p class="text-sm mt-1">Pilih tanggal terlebih dahulu untuk menampilkan data</p>
		</div>
	{:else if monitoringData.length === 0}
		<div
			class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm"
		>
			<ExclamationCircleOutline class="w-4 h-4 flex-shrink-0" />
			Tidak/belum ada data proses penyortiran barang atas tanggal
			<strong class="ml-1">{selectedDate}</strong>
		</div>
	{:else}
		<!-- ── Summary Cards ───────────────────────────────────── -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			<div
				class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
			>
				<div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
					<SortOutline class="w-5 h-5 text-blue-600 dark:text-blue-300" />
				</div>
				<div class="min-w-0">
					<p class="text-xs text-gray-500 dark:text-gray-400">Total No. Pick</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">{totalPick}</p>
				</div>
			</div>

			<div
				class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
			>
				<div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
					<CheckCircleSolid class="w-5 h-5 text-green-600 dark:text-green-300" />
				</div>
				<div class="min-w-0">
					<p class="text-xs text-gray-500 dark:text-gray-400">Selesai</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">{totalCompleted}</p>
				</div>
			</div>

			<div
				class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
			>
				<div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-shrink-0">
					<ClockSolid class="w-5 h-5 text-yellow-600 dark:text-yellow-300" />
				</div>
				<div class="min-w-0">
					<p class="text-xs text-gray-500 dark:text-gray-400">Dalam Proses</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">{totalInProgress}</p>
				</div>
			</div>

			<div
				class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
			>
				<div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0">
					<DotsHorizontalOutline class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				</div>
				<div class="min-w-0">
					<p class="text-xs text-gray-500 dark:text-gray-400">Menunggu</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">{totalPending}</p>
				</div>
			</div>
		</div>

		<!-- ── Search & Filter Bar ─────────────────────────────── -->
		<div class="flex flex-col sm:flex-row gap-3 mb-4">
			<div class="flex-1">
				<Search
					bind:value={searchValue}
					placeholder="Cari nomor pick, nama toko, atau kode toko..."
					size="md"
				/>
			</div>
			<div class="flex gap-2">
				<Select bind:value={statusFilter} size="md" class="min-w-[160px]" items={statusOptions} />
				<Button color="light" size="md" onclick={resetFilter}>
					<ArrowsRepeatOutline class="w-4 h-4 me-1" />
					Reset
				</Button>
			</div>
		</div>

		<!-- ── Filter aktif indicator ───────────────────────────── -->
		{#if searchValue || statusFilter !== 'all'}
			<div class="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
				<AdjustmentsHorizontalOutline class="w-4 h-4" />
				<span>Filter aktif:</span>
				{#if searchValue}
					<Badge color="blue">Kata kunci: "{searchValue}"</Badge>
				{/if}
				{#if statusFilter !== 'all'}
					<Badge color="indigo"
						>Status: {statusOptions.find((o) => o.value === statusFilter)?.name}</Badge
					>
				{/if}
				<span>— {filteredData.length} hasil ditemukan</span>
			</div>
		{/if}

		<!-- ── Tabel ─────────────────────────────────────────────── -->
		<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
			<Table hoverable={true}>
				<TableHead>
					<TableHeadCell>Toko</TableHeadCell>
					<TableHeadCell>No Pick & SP</TableHeadCell>
					<TableHeadCell>Gate</TableHeadCell>
					<TableHeadCell>Tgl Waktu Proses</TableHeadCell>
					<TableHeadCell>Status Pemakaian Container</TableHeadCell>
					<TableHeadCell>Status Sortasi</TableHeadCell>
					<TableHeadCell>Progress</TableHeadCell>
				</TableHead>
				<TableBody>
					{#if filteredData.length === 0}
						<TableBodyRow>
							<TableBodyCell colspan={7}>
								<div
									class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500"
								>
									<ExclamationCircleOutline class="w-12 h-12 mb-3 opacity-40" />
									<p class="font-medium">Tidak ada data sortasi</p>
									<p class="text-sm mt-1">
										{searchValue || statusFilter !== 'all'
											? 'Coba ubah kata kunci atau filter status'
											: 'Belum ada data sortasi tersedia'}
									</p>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{:else}
						{#each filteredData as item}
							<TableBodyRow
								class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
								onclick={() => {
									openDetails(item);
								}}
							>
								<TableBodyCell>
									<div class="font-medium text-gray-900 dark:text-white">
										{item.tokoname || '-'}
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
										Kode: {item.toko || '-'}
									</div>
								</TableBodyCell>
								<TableBodyCell>
									<div class="font-mono text-sm font-medium text-gray-900 dark:text-white">
										{item.nopick}
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
										SP: {item.no_urutsp || '-'}
									</div>
								</TableBodyCell>
								<TableBodyCell>
									<Badge color="dark" class="font-mono text-xs">{item.gate || '-'}</Badge>
								</TableBodyCell>
								<TableBodyCell class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
									{formatDate(item.created_at)}
								</TableBodyCell>
								<TableBodyCell>
									<Badge
										color={getContainerStatusConfig(item.fscanfraction).color}
										class="flex items-center w-fit gap-1 px-2.5 py-1 whitespace-nowrap"
									>
										<svelte:component this={getContainerStatusConfig(item.fscanfraction).icon} class="w-3 h-3" />
										{getContainerStatusConfig(item.fscanfraction).label}
									</Badge>
								</TableBodyCell>
								<TableBodyCell>
									<Badge
										color={getStatusConfig(item.status).color}
										class="flex items-center w-fit gap-1 px-2.5 py-1 whitespace-nowrap"
									>
										<svelte:component this={getStatusConfig(item.status).icon} class="w-3 h-3" />
										{getStatusConfig(item.status).label}
									</Badge>
								</TableBodyCell>
								<TableBodyCell class="w-52">
									<div
										class="flex justify-between text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300"
									>
										<span class="font-semibold">{item.progress_percentage}%</span>
										<span class="text-gray-500"
											>({item.scanned_containers}/{item.total_containers})</span
										>
									</div>
									<Progressbar
										progress={item.progress_percentage}
										color={getProgressColor(item.progress_percentage)}
										size="h-2"
									/>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</div>
	{/if}
</Card>

<!-- ── Detail Modal ────────────────────────────────────────── -->
<Modal
	title={`Detail Container - ${selectedProcess?.nopick || ''}`}
	bind:open={detailModal}
	size="xl"
	outsideclose
>
	{#if selectedProcess}
		<div class="mb-4">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h4 class="text-lg font-semibold text-gray-900 dark:text-white">
						{selectedProcess.tokoname}
					</h4>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Kode Toko: {selectedProcess.toko} | SP: {selectedProcess.no_urutsp}
					</p>
				</div>
				<Badge color={getStatusConfig(selectedProcess.status).color} class="text-sm">
					{getStatusConfig(selectedProcess.status).label}
				</Badge>
			</div>

			{#if !isLoadingDetails && containerDetails.length > 0}
				<div class="flex flex-wrap gap-3 mb-4">
					<div
						class="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
					>
						<span class="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Container</span
						>
						<span class="text-sm font-bold text-blue-700 dark:text-blue-300"
							>{containerDetails.length}</span
						>
					</div>
					<div
						class="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
					>
						<CheckCircleSolid class="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
						<span class="text-xs text-green-600 dark:text-green-400 font-medium">Scanned</span>
						<span class="text-sm font-bold text-green-700 dark:text-green-300"
							>{containerDetails.filter((d) => d.is_scanned).length}</span
						>
					</div>
					<div
						class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
					>
						<DotsHorizontalOutline class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
						<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending</span>
						<span class="text-sm font-bold text-gray-700 dark:text-gray-300"
							>{containerDetails.filter((d) => !d.is_scanned).length}</span
						>
					</div>
				</div>
			{/if}

			{#if isLoadingDetails}
				<div class="flex justify-center items-center py-12">
					<Spinner size="8" class="mr-3" />
					<span class="text-gray-500 dark:text-gray-400">Memuat data container...</span>
				</div>
			{:else if containerDetails.length === 0}
				<div class="text-center py-8 text-gray-500 dark:text-gray-400">
					<ExclamationCircleOutline class="mx-auto h-8 w-8 mb-2 opacity-40" />
					<p>Tidak ada data container untuk proses ini</p>
				</div>
			{:else}
				<div
					class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-96"
				>
					<Table hoverable={true}>
						<TableHead class="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
							<TableHeadCell>No Container</TableHeadCell>
							<TableHeadCell>Zona</TableHeadCell>
							<TableHeadCell>Status Scan</TableHeadCell>
							<TableHeadCell>Waktu Scan</TableHeadCell>
							<TableHeadCell>Discan Oleh</TableHeadCell>
						</TableHead>
						<TableBody>
							{#each containerDetails as detail}
								<TableBodyRow>
									<TableBodyCell class="font-mono font-medium">{detail.dusno}</TableBodyCell>
									<TableBodyCell>
										<Badge color="light" class="flex items-center w-fit gap-1">
											<MapPinSolid class="w-3 h-3 text-gray-500" />
											{detail.zona || '-'}
										</Badge>
									</TableBodyCell>
									<TableBodyCell>
										{#if detail.is_scanned}
											<Badge color="green" class="flex items-center w-fit gap-1 px-2 py-0.5">
												<CheckCircleSolid class="w-3 h-3" /> Scanned
											</Badge>
										{:else}
											<Badge color="gray" class="flex items-center w-fit gap-1 px-2 py-0.5">
												<DotsHorizontalOutline class="w-3 h-3" /> Pending
											</Badge>
										{/if}
									</TableBodyCell>
									<TableBodyCell class="text-sm text-gray-500">
										{formatDate(detail.scanned_at)}
									</TableBodyCell>
									<TableBodyCell>
										{#if detail.scanned_by}
											<div
												class="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-300"
											>
												<UserCircleSolid class="w-4 h-4 text-gray-400" />
												{detail.scanned_by}
											</div>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{/if}
		</div>
	{/if}
	<svelte:fragment slot="footer">
		<Button
			color="alternative"
			onclick={() => {
				detailModal = false;
			}}>Tutup</Button
		>
	</svelte:fragment>
</Modal>
