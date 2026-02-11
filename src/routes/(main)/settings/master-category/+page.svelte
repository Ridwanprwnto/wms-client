<script lang="ts">
	import { Card, Heading, Tabs, TabItem, Button, Modal, Label, Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { PlusOutline, EditOutline, TrashBinOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';
	
	export let data;
	
	let showDivisiModal = false;
	let showDepartemenModal = false;
	let showKategoriModal = false;
	
	// Delete confirmation modals
	let showDeleteDivisiModal = false;
	let showDeleteDepartemenModal = false;
	let showDeleteKategoriModal = false;
	
	let editMode = false;
	let editId: number | null = null;
	
	// Delete data
	let deleteItem: any = null;
	
	// Form data
	let divisiForm = { nama: '' };
	let departemenForm = { nama: '', divisi_id: '' };
	let kategoriForm = { nama: '', departemen_id: '' };
	
	function openDivisiModal(item?: any) {
		if (item) {
			editMode = true;
			editId = item.id;
			divisiForm.nama = item.nama;
		} else {
			editMode = false;
			editId = null;
			divisiForm.nama = '';
		}
		showDivisiModal = true;
	}
	
	function openDepartemenModal(item?: any) {
		if (item) {
			editMode = true;
			editId = item.id;
			departemenForm.nama = item.nama;
			departemenForm.divisi_id = item.divisi_id;
		} else {
			editMode = false;
			editId = null;
			departemenForm.nama = '';
			departemenForm.divisi_id = '';
		}
		showDepartemenModal = true;
	}
	
	function openKategoriModal(item?: any) {
		if (item) {
			editMode = true;
			editId = item.id;
			kategoriForm.nama = item.nama;
			kategoriForm.departemen_id = item.departemen_id;
		} else {
			editMode = false;
			editId = null;
			kategoriForm.nama = '';
			kategoriForm.departemen_id = '';
		}
		showKategoriModal = true;
	}
	
	function closeModal() {
		showDivisiModal = false;
		showDepartemenModal = false;
		showKategoriModal = false;
	}
	
	// Delete confirmation functions
	function confirmDeleteDivisi(item: any) {
		deleteItem = item;
		showDeleteDivisiModal = true;
	}
	
	function confirmDeleteDepartemen(item: any) {
		deleteItem = item;
		showDeleteDepartemenModal = true;
	}
	
	function confirmDeleteKategori(item: any) {
		deleteItem = item;
		showDeleteKategoriModal = true;
	}
	
	function closeDeleteModal() {
		showDeleteDivisiModal = false;
		showDeleteDepartemenModal = false;
		showDeleteKategoriModal = false;
		deleteItem = null;
	}
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<div class="mb-4">
		<Heading tag="h3" class="mb-2 -ml-0.25 text-xl font-semibold dark:text-white">
			Master Kategori
		</Heading>
		
		<Tabs tabStyle="underline">
			<!-- TAB DIVISI -->
			<TabItem open title="Divisi">
				<div class="mb-4">
					<Button onclick={() => openDivisiModal()} color="blue">
						<PlusOutline class="me-2 h-4 w-4" />
						Tambah Divisi
					</Button>
				</div>
				
				<Table hoverable={true}>
					<TableHead>
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Nama Divisi</TableHeadCell>
						<TableHeadCell>Aksi</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each data.divisi as item, i}
							<TableBodyRow>
								<TableBodyCell>{i + 1}</TableBodyCell>
								<TableBodyCell>{item.nama}</TableBodyCell>
								<TableBodyCell>
									<div class="flex gap-2">
										<Button size="xs" color="yellow" onclick={() => openDivisiModal(item)}>
											<EditOutline class="h-4 w-4" />
										</Button>
										<Button size="xs" color="red" onclick={() => confirmDeleteDivisi(item)}>
											<TrashBinOutline class="h-4 w-4" />
										</Button>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</TabItem>
			
			<!-- TAB DEPARTEMEN -->
			<TabItem title="Departemen">
				<div class="mb-4">
					<Button onclick={() => openDepartemenModal()} color="blue">
						<PlusOutline class="me-2 h-4 w-4" />
						Tambah Departemen
					</Button>
				</div>
				
				<Table hoverable={true}>
					<TableHead>
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Nama Departemen</TableHeadCell>
						<TableHeadCell>Divisi</TableHeadCell>
						<TableHeadCell>Aksi</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each data.departemen as item, i}
							<TableBodyRow>
								<TableBodyCell>{i + 1}</TableBodyCell>
								<TableBodyCell>{item.nama}</TableBodyCell>
								<TableBodyCell>
									{data.divisi.find(d => d.id === item.divisi_id)?.nama || '-'}
								</TableBodyCell>
								<TableBodyCell>
									<div class="flex gap-2">
										<Button size="xs" color="yellow" onclick={() => openDepartemenModal(item)}>
											<EditOutline class="h-4 w-4" />
										</Button>
										<Button size="xs" color="red" onclick={() => confirmDeleteDepartemen(item)}>
											<TrashBinOutline class="h-4 w-4" />
										</Button>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</TabItem>
			
			<!-- TAB KATEGORI -->
			<TabItem title="Kategori">
				<div class="mb-4">
					<Button onclick={() => openKategoriModal()} color="blue">
						<PlusOutline class="me-2 h-4 w-4" />
						Tambah Kategori
					</Button>
				</div>
				
				<Table hoverable={true}>
					<TableHead>
						<TableHeadCell>No</TableHeadCell>
						<TableHeadCell>Nama Kategori</TableHeadCell>
						<TableHeadCell>Departemen</TableHeadCell>
						<TableHeadCell>Divisi</TableHeadCell>
						<TableHeadCell>Aksi</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each data.kategori as item, i}
							{@const dept = data.departemen.find(d => d.id === item.departemen_id)}
							{@const div = dept ? data.divisi.find(d => d.id === dept.divisi_id) : null}
							<TableBodyRow>
								<TableBodyCell>{i + 1}</TableBodyCell>
								<TableBodyCell>{item.nama}</TableBodyCell>
								<TableBodyCell>{dept?.nama || '-'}</TableBodyCell>
								<TableBodyCell>{div?.nama || '-'}</TableBodyCell>
								<TableBodyCell>
									<div class="flex gap-2">
										<Button size="xs" color="yellow" onclick={() => openKategoriModal(item)}>
											<EditOutline class="h-4 w-4" />
										</Button>
										<Button size="xs" color="red" onclick={() => confirmDeleteKategori(item)}>
											<TrashBinOutline class="h-4 w-4" />
										</Button>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</TabItem>
		</Tabs>
	</div>
</Card>

<!-- MODAL DIVISI -->
<Modal bind:open={showDivisiModal} size="xs" autoclose={false}>
	<form method="POST" action="?/{editMode ? 'updateDivisi' : 'createDivisi'}" use:enhance on:submit={closeModal}>
		{#if editMode}
			<input type="hidden" name="id" value={editId} />
		{/if}
		
		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{editMode ? 'Edit' : 'Tambah'} Divisi
		</h3>
		
		<Label class="mb-2">
			Nama Divisi
			<Input name="nama" bind:value={divisiForm.nama} required class="mt-1" />
		</Label>
		
		<div class="mt-4 flex gap-2">
			<Button type="submit" color="blue">Simpan</Button>
			<Button color="alternative" onclick={closeModal}>Batal</Button>
		</div>
	</form>
</Modal>

<!-- MODAL DEPARTEMEN -->
<Modal bind:open={showDepartemenModal} size="xs" autoclose={false}>
	<form method="POST" action="?/{editMode ? 'updateDepartemen' : 'createDepartemen'}" use:enhance on:submit={closeModal}>
		{#if editMode}
			<input type="hidden" name="id" value={editId} />
		{/if}
		
		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{editMode ? 'Edit' : 'Tambah'} Departemen
		</h3>
		
		<Label class="mb-2">
			Divisi
			<select name="divisi_id" bind:value={departemenForm.divisi_id} required class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
				<option value="">Pilih Divisi</option>
				{#each data.divisi as divisi}
					<option value={divisi.id}>{divisi.nama}</option>
				{/each}
			</select>
		</Label>
		
		<Label class="mb-2">
			Nama Departemen
			<Input name="nama" bind:value={departemenForm.nama} required class="mt-1" />
		</Label>
		
		<div class="mt-4 flex gap-2">
			<Button type="submit" color="blue">Simpan</Button>
			<Button color="alternative" onclick={closeModal}>Batal</Button>
		</div>
	</form>
</Modal>

<!-- MODAL KATEGORI -->
<Modal bind:open={showKategoriModal} size="xs" autoclose={false}>
	<form method="POST" action="?/{editMode ? 'updateKategori' : 'createKategori'}" use:enhance on:submit={closeModal}>
		{#if editMode}
			<input type="hidden" name="id" value={editId} />
		{/if}
		
		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{editMode ? 'Edit' : 'Tambah'} Kategori
		</h3>
		
		<Label class="mb-2">
			Departemen
			<select name="departemen_id" bind:value={kategoriForm.departemen_id} required class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
				<option value="">Pilih Departemen</option>
				{#each data.departemen as dept}
					<option value={dept.id}>{dept.nama}</option>
				{/each}
			</select>
		</Label>
		
		<Label class="mb-2">
			Nama Kategori
			<Input name="nama" bind:value={kategoriForm.nama} required class="mt-1" />
		</Label>
		
		<div class="mt-4 flex gap-2">
			<Button type="submit" color="blue">Simpan</Button>
			<Button color="alternative" onclick={closeModal}>Batal</Button>
		</div>
	</form>
</Modal>

<!-- MODAL KONFIRMASI DELETE DIVISI -->
<Modal bind:open={showDeleteDivisiModal} size="xs" autoclose={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Apakah Anda yakin ingin menghapus divisi <span class="font-semibold">"{deleteItem?.nama}"</span>?
		</h3>
		<p class="mb-5 text-sm text-gray-400 dark:text-gray-500">
			Data yang sudah dihapus tidak dapat dikembalikan.
		</p>
		<form method="POST" action="?/deleteDivisi" use:enhance on:submit={closeDeleteModal}>
			<input type="hidden" name="id" value={deleteItem?.id} />
			<div class="flex justify-center gap-4">
				<Button color="red" type="submit">Ya, Hapus</Button>
				<Button color="alternative" onclick={closeDeleteModal}>Batal</Button>
			</div>
		</form>
	</div>
</Modal>

<!-- MODAL KONFIRMASI DELETE DEPARTEMEN -->
<Modal bind:open={showDeleteDepartemenModal} size="xs" autoclose={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Apakah Anda yakin ingin menghapus departemen <span class="font-semibold">"{deleteItem?.nama}"</span>?
		</h3>
		<p class="mb-5 text-sm text-gray-400 dark:text-gray-500">
			Data yang sudah dihapus tidak dapat dikembalikan.
		</p>
		<form method="POST" action="?/deleteDepartemen" use:enhance on:submit={closeDeleteModal}>
			<input type="hidden" name="id" value={deleteItem?.id} />
			<div class="flex justify-center gap-4">
				<Button color="red" type="submit">Ya, Hapus</Button>
				<Button color="alternative" onclick={closeDeleteModal}>Batal</Button>
			</div>
		</form>
	</div>
</Modal>

<!-- MODAL KONFIRMASI DELETE KATEGORI -->
<Modal bind:open={showDeleteKategoriModal} size="xs" autoclose={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Apakah Anda yakin ingin menghapus kategori <span class="font-semibold">"{deleteItem?.nama}"</span>?
		</h3>
		<p class="mb-5 text-sm text-gray-400 dark:text-gray-500">
			Data yang sudah dihapus tidak dapat dikembalikan.
		</p>
		<form method="POST" action="?/deleteKategori" use:enhance on:submit={closeDeleteModal}>
			<input type="hidden" name="id" value={deleteItem?.id} />
			<div class="flex justify-center gap-4">
				<Button color="red" type="submit">Ya, Hapus</Button>
				<Button color="alternative" onclick={closeDeleteModal}>Batal</Button>
			</div>
		</form>
	</div>
</Modal>