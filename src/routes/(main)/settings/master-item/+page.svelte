<script lang="ts">
	import {
		Card,
		Heading,
		Button,
		Modal,
		Label,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Badge,
		Accordion,
		AccordionItem,
		Spinner,
		Search
	} from 'flowbite-svelte';
	import {
		PlusOutline,
		EditOutline,
		TrashBinOutline,
		ExclamationCircleOutline,
		ChevronDownOutline,
		BarcodeOutline,
		RulerCombinedOutline
	} from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	export let data;

	let showBarangModal = false;
	let showDeleteModal = false;
	let showDimensiModal = false;
	let showBarcodeModal = false;

	let editMode = false;
	let editId: string | null = null;
	let deleteItem: any = null;
	let currentBarang: any = null;

	// Lazy loading state
	let displayedItems = 10; // Jumlah item awal yang ditampilkan
	let isLoading = false;
	let hasMore = true;
	let searchQuery = '';
	let filteredBarang: any[] = [];

	// Form data
	let barangForm = {
		divisi_id: '',
		departemen_id: '',
		kategori_id: '',
		kode_barang: '',
		nama_barang: '',
		kemasan: ''
	};

	// Dimensi & Barcode untuk form tambah barang
	let dimensiList: any[] = [];
	let barcodeList: string[] = [];
	let tempDimensi = {
		satuan: 'ctn',
		panjang: '',
		lebar: '',
		tinggi: '',
		berat: ''
	};
	let tempBarcode = '';

	let dimensiForm = {
		barang_id: '',
		satuan: 'ctn',
		panjang: '',
		lebar: '',
		tinggi: '',
		berat: ''
	};

	let barcodeForm = {
		barang_id: '',
		barcode: ''
	};

	// Initialize filtered data
	$: {
		if (searchQuery.trim() === '') {
			filteredBarang = data.barang;
		} else {
			const query = searchQuery.toLowerCase();
			filteredBarang = data.barang.filter(
				(item) =>
					item.kode_barang.toLowerCase().includes(query) ||
					item.nama_barang.toLowerCase().includes(query)
			);
		}
		// Reset displayed items when search changes
		displayedItems = 10;
		hasMore = filteredBarang.length > displayedItems;
	}

	// Get items to display based on lazy loading
	$: displayedBarang = filteredBarang.slice(0, displayedItems);

	// Lazy loading function
	function loadMore() {
		if (isLoading || !hasMore) return;

		isLoading = true;

		// Simulate API call delay
		setTimeout(() => {
			displayedItems += 10;
			hasMore = displayedItems < filteredBarang.length;
			isLoading = false;
		}, 300);
	}

	// Infinite scroll handler
	function handleScroll(event: any) {
		const element = event.target;
		const threshold = 100; // pixels from bottom

		if (element.scrollHeight - element.scrollTop - element.clientHeight < threshold) {
			loadMore();
		}
	}

	// Filtered departemen dan kategori berdasarkan pilihan
	$: filteredDepartemen = barangForm.divisi_id
		? data.departemen.filter((d) => d.divisi_id === barangForm.divisi_id)
		: [];

	$: filteredKategori = barangForm.departemen_id
		? data.kategori.filter((k) => k.departemen_id === barangForm.departemen_id)
		: [];

	function openBarangModal(item?: any) {
		if (item) {
			editMode = true;
			editId = item.id;
			barangForm = {
				divisi_id: item.divisi_id,
				departemen_id: item.departemen_id,
				kategori_id: item.kategori_id,
				kode_barang: item.kode_barang,
				nama_barang: item.nama_barang,
				kemasan: item.kemasan
			};
			// Reset dimensi & barcode list saat edit
			dimensiList = [];
			barcodeList = [];
		} else {
			editMode = false;
			editId = null;
			barangForm = {
				divisi_id: '',
				departemen_id: '',
				kategori_id: '',
				kode_barang: '',
				nama_barang: '',
				kemasan: ''
			};
			// Reset dimensi & barcode list
			dimensiList = [];
			barcodeList = [];
			tempDimensi = {
				satuan: 'ctn',
				panjang: '',
				lebar: '',
				tinggi: '',
				berat: ''
			};
			tempBarcode = '';
		}
		showBarangModal = true;
	}

	// Function untuk menambah dimensi ke list
	function addDimensiToList() {
		// Validasi
		if (!tempDimensi.panjang || !tempDimensi.lebar || !tempDimensi.tinggi || !tempDimensi.berat) {
			alert('Mohon lengkapi semua field dimensi');
			return;
		}

		// Check duplicate satuan
		if (dimensiList.some((d) => d.satuan === tempDimensi.satuan)) {
			alert(`Dimensi dengan satuan ${tempDimensi.satuan} sudah ada`);
			return;
		}

		dimensiList = [...dimensiList, { ...tempDimensi }];

		// Reset form
		tempDimensi = {
			satuan: tempDimensi.satuan === 'ctn' ? 'pcs' : 'ctn',
			panjang: '',
			lebar: '',
			tinggi: '',
			berat: ''
		};
	}

	// Function untuk menghapus dimensi dari list
	function removeDimensiFromList(index: number) {
		dimensiList = dimensiList.filter((_, i) => i !== index);
	}

	// Function untuk menambah barcode ke list
	function addBarcodeToList() {
		if (!tempBarcode.trim()) {
			alert('Mohon masukkan barcode');
			return;
		}

		// Check duplicate
		if (barcodeList.includes(tempBarcode.trim())) {
			alert('Barcode sudah ada dalam list');
			return;
		}

		// Check duplicate di database
		if (data.barcode.some((b) => b.barcode === tempBarcode.trim())) {
			alert('Barcode sudah digunakan di sistem');
			return;
		}

		barcodeList = [...barcodeList, tempBarcode.trim()];
		tempBarcode = '';
	}

	// Function untuk menghapus barcode dari list
	function removeBarcodeFromList(index: number) {
		barcodeList = barcodeList.filter((_, i) => i !== index);
	}

	function openDimensiModal(barang: any, dimensi?: any) {
		currentBarang = barang;
		if (dimensi) {
			editMode = true;
			editId = dimensi.id;
			dimensiForm = {
				barang_id: barang.id,
				satuan: dimensi.satuan,
				panjang: dimensi.panjang,
				lebar: dimensi.lebar,
				tinggi: dimensi.tinggi,
				berat: dimensi.berat
			};
		} else {
			editMode = false;
			editId = null;
			dimensiForm = {
				barang_id: barang.id,
				satuan: 'ctn',
				panjang: '',
				lebar: '',
				tinggi: '',
				berat: ''
			};
		}
		showDimensiModal = true;
	}

	function openBarcodeModal(barang: any, barcode?: any) {
		currentBarang = barang;
		if (barcode) {
			editMode = true;
			editId = barcode.id;
			barcodeForm = {
				barang_id: barang.id,
				barcode: barcode.barcode
			};
		} else {
			editMode = false;
			editId = null;
			barcodeForm = {
				barang_id: barang.id,
				barcode: ''
			};
		}
		showBarcodeModal = true;
	}

	function confirmDelete(item: any) {
		deleteItem = item;
		showDeleteModal = true;
	}

	function closeModal() {
		showBarangModal = false;
		showDimensiModal = false;
		showBarcodeModal = false;
		showDeleteModal = false;
		editMode = false;
		editId = null;
		deleteItem = null;
		currentBarang = null;
		dimensiList = [];
		barcodeList = [];
		tempDimensi = {
			satuan: 'ctn',
			panjang: '',
			lebar: '',
			tinggi: '',
			berat: ''
		};
		tempBarcode = '';
	}

	// Helper untuk mendapatkan nama dari ID
	function getDivisiName(id: string) {
		return data.divisi.find((d) => d.id === id)?.nama || '-';
	}

	function getDepartemenName(id: string) {
		return data.departemen.find((d) => d.id === id)?.nama || '-';
	}

	function getKategoriName(id: string) {
		return data.kategori.find((k) => k.id === id)?.nama || '-';
	}

	// Get dimensi dan barcode untuk barang tertentu
	function getDimensiByBarang(barangId: string) {
		return data.dimensi.filter((d) => d.barang_id === barangId);
	}

	function getBarcodeByBarang(barangId: string) {
		return data.barcode.filter((b) => b.barang_id === barangId);
	}
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<div class="mb-4">
		<div class="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<Heading tag="h3" class="text-xl font-semibold dark:text-white">Master Barang</Heading>
			<Button onclick={() => openBarangModal()} color="blue">
				<PlusOutline class="me-2 h-4 w-4" />
				Tambah Barang
			</Button>
		</div>

		<!-- Search Bar -->
		<div class="mb-4">
			<Search
				placeholder="Cari berdasarkan kode atau nama barang..."
				bind:value={searchQuery}
				size="md"
			/>
		</div>

		<!-- Info Total -->
		<div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
			Menampilkan {displayedBarang.length} dari {filteredBarang.length} barang
			{#if searchQuery}
				<Badge color="blue" class="ml-2">Pencarian: "{searchQuery}"</Badge>
			{/if}
		</div>

		<!-- List Container with Scroll -->
		<div
			class="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
			onscroll={handleScroll}
		>
			{#if displayedBarang.length === 0}
				<div class="text-center py-12 text-gray-500 dark:text-gray-400">
					<ChevronDownOutline class="mx-auto h-12 w-12 mb-3 opacity-50" />
					<p class="text-lg font-medium">Tidak ada barang ditemukan</p>
					{#if searchQuery}
						<p class="text-sm">Coba gunakan kata kunci lain</p>
					{/if}
				</div>
			{:else}
				{#each displayedBarang as item, index}
					<Accordion>
						<AccordionItem>
							{#snippet header()}
								<span slot="header" class="flex items-center justify-between w-full">
									<div class="flex items-center gap-3 flex-1">
										<!-- Nomor -->
										<div
											class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold"
										>
											{index + 1}
										</div>

										<!-- Icon Package -->
										<ChevronDownOutline
											class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
										/>

										<!-- Info Barang -->
										<div class="flex-1 min-w-0">
											<div class="flex flex-wrap items-center gap-2 mb-1">
												<Badge color="indigo" class="font-mono text-xs">{item.kode_barang}</Badge>
												<span class="font-semibold text-gray-900 dark:text-white truncate">
													{item.nama_barang}
												</span>
											</div>
											<div
												class="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1"
											>
												<span>{getDivisiName(item.divisi_id)}</span>
												<span class="text-gray-300 dark:text-gray-600">→</span>
												<span>{getDepartemenName(item.departemen_id)}</span>
												<span class="text-gray-300 dark:text-gray-600">→</span>
												<span>{getKategoriName(item.kategori_id)}</span>
												<span class="text-gray-300 dark:text-gray-600">|</span>
												<Badge color="green" class="text-xs">{item.kemasan}</Badge>
											</div>
										</div>
									</div>

									<!-- Action Buttons -->
									<div class="flex gap-2 mr-2" onclick={(e) => e.stopPropagation()}>
										<Button size="xs" color="yellow" onclick={() => openBarangModal(item)}>
											<EditOutline class="h-4 w-4" />
										</Button>
										<Button size="xs" color="red" onclick={() => confirmDelete(item)}>
											<TrashBinOutline class="h-4 w-4" />
										</Button>
									</div>
								</span>
							{/snippet}

							<div class="space-y-4 p-4 bg-gray-50 dark:bg-gray-800">
								<!-- Info Barang -->
								<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label class="text-xs text-gray-500 dark:text-gray-400">Kode Barang</Label>
										<div class="font-medium text-gray-900 dark:text-white">{item.kode_barang}</div>
									</div>
									<div>
										<Label class="text-xs text-gray-500 dark:text-gray-400">Nama Barang</Label>
										<div class="font-medium text-gray-900 dark:text-white">{item.nama_barang}</div>
									</div>
									<div>
										<Label class="text-xs text-gray-500 dark:text-gray-400">Kemasan</Label>
										<div class="font-medium text-gray-900 dark:text-white">{item.kemasan}</div>
									</div>
								</div>

								<hr class="border-gray-200 dark:border-gray-700" />

								<!-- Dimensi Section -->
								<div>
									<div class="flex items-center justify-between mb-3">
										<div class="flex items-center gap-2">
											<RulerCombinedOutline class="h-4 w-4 text-green-600 dark:text-green-400" />
											<h4 class="font-semibold text-gray-900 dark:text-white">Dimensi</h4>
										</div>
										<Button size="xs" color="green" onclick={() => openDimensiModal(item)}>
											<PlusOutline class="h-3 w-3 me-1" />
											Tambah Dimensi
										</Button>
									</div>

									{#if getDimensiByBarang(item.id).length > 0}
										<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
											{#each getDimensiByBarang(item.id) as dimensi}
												<div
													class="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
												>
													<div class="flex justify-between items-start mb-2">
														<Badge color="green">{dimensi.satuan}</Badge>
														<div class="flex gap-1">
															<Button
																size="xs"
																color="yellow"
																onclick={() => openDimensiModal(item, dimensi)}
															>
																<EditOutline class="h-3 w-3" />
															</Button>
															<form
																method="POST"
																action="?/deleteDimensi"
																use:enhance
																onsubmit={closeModal}
															>
																<input type="hidden" name="id" value={dimensi.id} />
																<Button size="xs" color="red" type="submit">
																	<TrashBinOutline class="h-3 w-3" />
																</Button>
															</form>
														</div>
													</div>
													<div
														class="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300"
													>
														<div>
															<span class="text-gray-500 dark:text-gray-400">P:</span>
															{dimensi.panjang} cm
														</div>
														<div>
															<span class="text-gray-500 dark:text-gray-400">L:</span>
															{dimensi.lebar} cm
														</div>
														<div>
															<span class="text-gray-500 dark:text-gray-400">T:</span>
															{dimensi.tinggi} cm
														</div>
														<div>
															<span class="text-gray-500 dark:text-gray-400">Berat:</span>
															{dimensi.berat} kg
														</div>
													</div>
												</div>
											{/each}
										</div>
									{:else}
										<p class="text-sm text-gray-500 dark:text-gray-400 italic">
											Belum ada data dimensi
										</p>
									{/if}
								</div>

								<hr class="border-gray-200 dark:border-gray-700" />

								<!-- Barcode Section -->
								<div>
									<div class="flex items-center justify-between mb-3">
										<div class="flex items-center gap-2">
											<BarcodeOutline class="h-4 w-4 text-purple-600 dark:text-purple-400" />
											<h4 class="font-semibold text-gray-900 dark:text-white">Barcode</h4>
										</div>
										<Button size="xs" color="purple" onclick={() => openBarcodeModal(item)}>
											<PlusOutline class="h-3 w-3 me-1" />
											Tambah Barcode
										</Button>
									</div>

									{#if getBarcodeByBarang(item.id).length > 0}
										<div class="flex flex-wrap gap-2">
											{#each getBarcodeByBarang(item.id) as barcode}
												<div
													class="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
												>
													<Badge color="purple" class="font-mono">{barcode.barcode}</Badge>
													<Button
														size="xs"
														color="yellow"
														onclick={() => openBarcodeModal(item, barcode)}
													>
														<EditOutline class="h-3 w-3" />
													</Button>
													<form
														method="POST"
														action="?/deleteBarcode"
														use:enhance
														onsubmit={closeModal}
													>
														<input type="hidden" name="id" value={barcode.id} />
														<Button size="xs" color="red" type="submit">
															<TrashBinOutline class="h-3 w-3" />
														</Button>
													</form>
												</div>
											{/each}
										</div>
									{:else}
										<p class="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada barcode</p>
									{/if}
								</div>
							</div>
						</AccordionItem>
					</Accordion>
				{/each}

				<!-- Loading Indicator -->
				{#if isLoading}
					<div class="flex justify-center py-4">
						<Spinner size="6" color="blue" />
					</div>
				{/if}

				<!-- Load More Button (Fallback) -->
				{#if hasMore && !isLoading && displayedBarang.length > 0}
					<div class="flex justify-center py-4">
						<Button color="light" onclick={loadMore}>Muat Lebih Banyak</Button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</Card>

<!-- MODAL BARANG -->
<Modal bind:open={showBarangModal} size="lg" autoclose={false} class="w-full">
	<form
		method="POST"
		action="?/{editMode ? 'updateBarang' : 'createBarang'}"
		use:enhance
		onsubmit={closeModal}
	>
		{#if editMode}
			<input type="hidden" name="id" value={editId} />
		{/if}

		<!-- Hidden fields untuk dimensi dan barcode -->
		{#if !editMode}
			<input type="hidden" name="dimensi_data" value={JSON.stringify(dimensiList)} />
			<input type="hidden" name="barcode_data" value={JSON.stringify(barcodeList)} />
		{/if}

		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{editMode ? 'Edit' : 'Tambah'} Barang
		</h3>

		<!-- Info Barang -->
		<div class="mb-6">
			<h4 class="mb-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
				<ChevronDownOutline class="h-4 w-4" />
				Informasi Barang
			</h4>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Label>
					Divisi
					<select
						name="divisi_id"
						bind:value={barangForm.divisi_id}
						required
						class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="">Pilih Divisi</option>
						{#each data.divisi as divisi}
							<option value={divisi.id}>{divisi.nama}</option>
						{/each}
					</select>
				</Label>

				<Label>
					Departemen
					<select
						name="departemen_id"
						bind:value={barangForm.departemen_id}
						required
						disabled={!barangForm.divisi_id}
						class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
					>
						<option value="">Pilih Departemen</option>
						{#each filteredDepartemen as dept}
							<option value={dept.id}>{dept.nama}</option>
						{/each}
					</select>
				</Label>

				<Label>
					Kategori
					<select
						name="kategori_id"
						bind:value={barangForm.kategori_id}
						required
						disabled={!barangForm.departemen_id}
						class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
					>
						<option value="">Pilih Kategori</option>
						{#each filteredKategori as kat}
							<option value={kat.id}>{kat.nama}</option>
						{/each}
					</select>
				</Label>

				<Label>
					Kode Barang
					<Input
						name="kode_barang"
						bind:value={barangForm.kode_barang}
						required
						class="mt-1"
						placeholder="8 digit kode barang"
					/>
				</Label>

				<Label class="md:col-span-2">
					Nama Barang
					<Input
						name="nama_barang"
						bind:value={barangForm.nama_barang}
						required
						class="mt-1"
						placeholder="Nama barang"
					/>
				</Label>

				<Label class="md:col-span-2">
					Kemasan
					<Input
						name="kemasan"
						bind:value={barangForm.kemasan}
						required
						class="mt-1"
						placeholder="Box, Pack, dll"
					/>
				</Label>
			</div>
		</div>

		{#if !editMode}
			<!-- Dimensi Section -->
			<div class="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
				<h4 class="mb-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<RulerCombinedOutline class="h-4 w-4 text-green-600 dark:text-green-400" />
					Dimensi (Opsional)
				</h4>

				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
					<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
						<Label>
							Satuan
							<select
								bind:value={tempDimensi.satuan}
								class="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							>
								<option value="ctn">Karton</option>
								<option value="pcs">Pcs</option>
							</select>
						</Label>

						<Label>
							Panjang (cm)
							<Input
								type="number"
								bind:value={tempDimensi.panjang}
								class="mt-1"
								step="0.01"
								placeholder="0"
							/>
						</Label>

						<Label>
							Lebar (cm)
							<Input
								type="number"
								bind:value={tempDimensi.lebar}
								class="mt-1"
								step="0.01"
								placeholder="0"
							/>
						</Label>

						<Label>
							Tinggi (cm)
							<Input
								type="number"
								bind:value={tempDimensi.tinggi}
								class="mt-1"
								step="0.01"
								placeholder="0"
							/>
						</Label>

						<Label>
							Berat (kg)
							<Input
								type="number"
								bind:value={tempDimensi.berat}
								class="mt-1"
								step="0.01"
								placeholder="0"
							/>
						</Label>
					</div>

					<Button size="sm" color="green" onclick={addDimensiToList} type="button">
						<PlusOutline class="h-3 w-3 me-1" />
						Tambah Dimensi
					</Button>
				</div>

				<!-- Dimensi List -->
				{#if dimensiList.length > 0}
					<div class="space-y-2">
						{#each dimensiList as dimensi, index}
							<div
								class="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
							>
								<div class="flex items-center gap-3">
									<Badge color="green">{dimensi.satuan}</Badge>
									<span class="text-sm text-gray-700 dark:text-gray-300">
										P: {dimensi.panjang} cm | L: {dimensi.lebar} cm | T: {dimensi.tinggi} cm | Berat:
										{dimensi.berat} kg
									</span>
								</div>
								<Button
									size="xs"
									color="red"
									onclick={() => removeDimensiFromList(index)}
									type="button"
								>
									<TrashBinOutline class="h-3 w-3" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Barcode Section -->
			<div class="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
				<h4 class="mb-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<BarcodeOutline class="h-4 w-4 text-purple-600 dark:text-purple-400" />
					Barcode (Opsional)
				</h4>

				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
					<div class="flex gap-3">
						<div class="flex-1">
							<Input
								bind:value={tempBarcode}
								placeholder="Masukkan barcode"
								class="font-mono"
								onkeypress={(e) => e.key === 'Enter' && (e.preventDefault(), addBarcodeToList())}
							/>
						</div>
						<Button color="purple" onclick={addBarcodeToList} type="button">
							<PlusOutline class="h-4 w-4 me-1" />
							Tambah
						</Button>
					</div>
				</div>

				<!-- Barcode List -->
				{#if barcodeList.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each barcodeList as barcode, index}
							<div
								class="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
							>
								<Badge color="purple" class="font-mono">{barcode}</Badge>
								<button
									onclick={() => removeBarcodeFromList(index)}
									type="button"
									class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
								>
									<TrashBinOutline class="h-3 w-3" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
			<Button type="submit" color="blue">
				{editMode ? 'Update' : 'Simpan'} Barang
			</Button>
			<Button color="alternative" onclick={closeModal} type="button">Batal</Button>
		</div>
	</form>
</Modal>

<!-- MODAL DIMENSI -->
<Modal bind:open={showDimensiModal} size="sm" autoclose={false}>
	<form
		method="POST"
		action="?/{editMode ? 'updateDimensi' : 'createDimensi'}"
		use:enhance
		onsubmit={closeModal}
	>
		{#if editMode}
			<input type="hidden" name="id" value={editId} />
		{/if}
		<input type="hidden" name="barang_id" value={dimensiForm.barang_id} />

		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{editMode ? 'Edit' : 'Tambah'} Dimensi
		</h3>

		<Label class="mb-3">
			Satuan
			<select
				name="satuan"
				bind:value={dimensiForm.satuan}
				required
				class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="ctn">Karton</option>
				<option value="pcs">Pcs</option>
			</select>
		</Label>

		<div class="grid grid-cols-2 gap-3 mb-3">
			<Label>
				Panjang (cm)
				<Input
					type="number"
					name="panjang"
					bind:value={dimensiForm.panjang}
					required
					class="mt-1"
					step="0.01"
				/>
			</Label>

			<Label>
				Lebar (cm)
				<Input
					type="number"
					name="lebar"
					bind:value={dimensiForm.lebar}
					required
					class="mt-1"
					step="0.01"
				/>
			</Label>

			<Label>
				Tinggi (cm)
				<Input
					type="number"
					name="tinggi"
					bind:value={dimensiForm.tinggi}
					required
					class="mt-1"
					step="0.01"
				/>
			</Label>

			<Label>
				Berat (kg)
				<Input
					type="number"
					name="berat"
					bind:value={dimensiForm.berat}
					required
					class="mt-1"
					step="0.01"
				/>
			</Label>
		</div>

		<div class="flex gap-2">
			<Button type="submit" color="green">Simpan</Button>
			<Button color="alternative" onclick={closeModal}>Batal</Button>
		</div>
	</form>
</Modal>

<!-- MODAL BARCODE -->
<Modal bind:open={showBarcodeModal} size="xs" autoclose={false}>
	<form
		method="POST"
		action="?/{editMode ? 'updateBarcode' : 'createBarcode'}"
		use:enhance
		onsubmit={closeModal}
	>
		{#if editMode}
			<input type="hidden" name="id" value={editId} />
		{/if}
		<input type="hidden" name="barang_id" value={barcodeForm.barang_id} />

		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{editMode ? 'Edit' : 'Tambah'} Barcode
		</h3>

		<Label class="mb-3">
			Barcode
			<Input
				name="barcode"
				bind:value={barcodeForm.barcode}
				required
				class="mt-1 font-mono"
				placeholder="8901234567890"
			/>
		</Label>

		<div class="flex gap-2">
			<Button type="submit" color="purple">Simpan</Button>
			<Button color="alternative" onclick={closeModal}>Batal</Button>
		</div>
	</form>
</Modal>

<!-- MODAL KONFIRMASI DELETE -->
<Modal bind:open={showDeleteModal} size="xs" autoclose={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Apakah Anda yakin ingin menghapus barang <span class="font-semibold"
				>"{deleteItem?.nama_barang}"</span
			>?
		</h3>
		<p class="mb-5 text-sm text-gray-400 dark:text-gray-500">
			Data yang sudah dihapus tidak dapat dikembalikan. Ini juga akan menghapus semua dimensi dan
			barcode terkait.
		</p>
		<form method="POST" action="?/deleteBarang" use:enhance onsubmit={closeModal}>
			<input type="hidden" name="id" value={deleteItem?.id} />
			<div class="flex justify-center gap-4">
				<Button color="red" type="submit">Ya, Hapus</Button>
				<Button color="alternative" onclick={closeModal}>Batal</Button>
			</div>
		</form>
	</div>
</Modal>
