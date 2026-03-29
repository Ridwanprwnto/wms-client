<script lang="ts">
	import {
		Card,
		Heading,
		Button,
		Modal,
		Label,
		Input,
		Badge,
		Accordion,
		AccordionItem,
		Spinner,
		Search,
		Tabs,
		TabItem
	} from 'flowbite-svelte';
	import {
		PlusOutline,
		EditOutline,
		TrashBinOutline,
		ExclamationCircleOutline,
		MapPinOutline,
		GridOutline,
		TagOutline,
		ListOutline,
		UploadOutline,
		DownloadOutline,
		CheckCircleOutline,
		CloseCircleOutline
	} from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';
	import { showSuccess, showError, showWarning, showInfo } from '$lib/utils/alertUtils.js';

	export let data;

	// ===================== SHARED STATE =====================
	let showDeleteModal = false;
	let deleteItem: any = null;
	let deleteAction = '';

	function confirmDelete(item: any, action: string) {
		deleteItem = item;
		deleteAction = action;
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		deleteItem = null;
		deleteAction = '';
	}

	// ===================== MASTER PLANO =====================
	let showMasterPlanoModal = false;
	let masterEditMode = false;
	let masterEditId: string | null = null;

	let masterPlanoForm = { line: '', type_id: '' };
	let linePlanoList: any[] = [];
	let tempLinePlano = { rack: '', shelf: '', cell: '', loc: '' };

	let previousTypeId = '';

	function handleTypeChange() {
		const prevTypeName = getTypeName(previousTypeId);
		const newTypeName = getTypeName(masterPlanoForm.type_id);

		if (
			previousTypeId !== '' &&
			masterPlanoForm.type_id !== previousTypeId &&
			prevTypeName !== newTypeName &&
			(prevTypeName === 'RACK' || prevTypeName === 'FLOOR') &&
			(newTypeName === 'RACK' || newTypeName === 'FLOOR')
		) {
			linePlanoList = [];
			tempLinePlano = { rack: '', shelf: '', cell: '', loc: '' };
			tempLinePlanoErrors = {};
		}
		previousTypeId = masterPlanoForm.type_id;
	}

	// Search & Lazy Load
	let masterSearchQuery = '';
	let masterDisplayedItems = 10;
	let masterIsLoading = false;

	$: masterHasMore = filteredMasterPlano.length > masterDisplayedItems;

	$: if (masterSearchQuery !== undefined) {
		masterDisplayedItems = 10;
	}

	$: filteredMasterPlano =
		masterSearchQuery.trim() === ''
			? data.masterPlano
			: data.masterPlano.filter(
					(item) =>
						item.line.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
						getTypeName(item.type_id).toLowerCase().includes(masterSearchQuery.toLowerCase())
				);

	$: displayedMasterPlano = filteredMasterPlano.slice(0, masterDisplayedItems);

	function loadMoreMaster() {
		if (masterIsLoading || !masterHasMore) return;
		masterIsLoading = true;
		setTimeout(() => {
			masterDisplayedItems += 10;
			masterIsLoading = false;
		}, 300);
	}

	function handleMasterScroll(event: any) {
		const el = event.target;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) loadMoreMaster();
	}

	function openMasterPlanoModal(item?: any) {
		if (item) {
			masterEditMode = true;
			masterEditId = item.id;
			masterPlanoForm = { line: item.line, type_id: item.type_id };
			previousTypeId = item.type_id;
			linePlanoList = [];
		} else {
			masterEditMode = false;
			masterEditId = null;
			masterPlanoForm = { line: '', type_id: '' };
			previousTypeId = '';
			linePlanoList = [];
			tempLinePlano = { rack: '', shelf: '', cell: '', loc: '' };
		}
		showMasterPlanoModal = true;
	}

	function closeMasterPlanoModal() {
		showMasterPlanoModal = false;
		masterEditMode = false;
		masterEditId = null;
		linePlanoList = [];
		tempLinePlano = { rack: '', shelf: '', cell: '', loc: '' };
		masterErrors = {};
		tempLinePlanoErrors = {};
		previousTypeId = '';
	}

	function addLinePlanoToList() {
		if (!validateTempLinePlano()) return;
		linePlanoList = [...linePlanoList, { ...tempLinePlano }];
		tempLinePlano = { rack: '', shelf: '', cell: '', loc: '' };
		tempLinePlanoErrors = {};
	}

	function removeLinePlanoFromList(index: number) {
		linePlanoList = linePlanoList.filter((_, i) => i !== index);
	}

	// ===================== VALIDASI =====================
	let masterErrors: { line?: string } = {};
	let linePlanoErrors: { rack?: string; shelf?: string; cell?: string; loc?: string } = {};
	let tempLinePlanoErrors: { rack?: string; shelf?: string; cell?: string; loc?: string } = {};

	const LINE_REGEX = /^[A-Z]{2}$/;
	const RACK_REGEX = /^\d{2}$/;
	const SHELF_REGEX = /^[1-9]$/;
	const CELL_REGEX = /^([1-9]|[1-9]\d)$/;
	const LOC_REGEX = /^([1-9]|[1-9]\d)$/;

	function validateLine(value: string): string | undefined {
		if (!value) return 'Line wajib diisi';
		if (!LINE_REGEX.test(value.toUpperCase()))
			return 'Line harus tepat 2 huruf (A-Z), contoh: AA, ZB';
	}

	function validateRack(value: string): string | undefined {
		if (!value) return 'Rack wajib diisi';
		if (!RACK_REGEX.test(value)) return 'Rack harus 2 digit angka, contoh: 01, 12';
	}

	function validateShelf(value: string): string | undefined {
		if (!value) return undefined;
		if (!SHELF_REGEX.test(value)) return 'Shelf harus 1 digit angka (1–9)';
	}

	function validateCell(value: string): string | undefined {
		if (!value) return undefined;
		if (!CELL_REGEX.test(value)) return 'Cell harus angka 1–99';
	}

	function validateLoc(value: string): string | undefined {
		if (!value) return 'Loc wajib diisi';
		if (!LOC_REGEX.test(value)) return 'Loc harus angka 1–99';
	}

	function isDuplicateLine(line: string, excludeId?: any): boolean {
		return data.masterPlano.some((m) => m.line === line.toUpperCase() && m.id !== excludeId);
	}

	function isDuplicateLinePlanoInDB(
		masterId: any,
		rack: string,
		shelf: string,
		cell: string,
		loc: string,
		excludeId?: any
	): boolean {
		return data.linePlano.some((lp) => {
			if (lp.master_id !== masterId) return false;
			if (lp.id === excludeId) return false;
			if (rack) {
				return (
					lp.rack === rack && (lp.shelf || '') === (shelf || '') && (lp.cell || '') === (cell || '')
				);
			} else {
				return lp.loc === loc;
			}
		});
	}

	function isDuplicateInTempList(rack: string, shelf: string, cell: string, loc: string): boolean {
		return linePlanoList.some((lp) => {
			if (rack) {
				return (
					lp.rack === rack && (lp.shelf || '') === (shelf || '') && (lp.cell || '') === (cell || '')
				);
			} else {
				return lp.loc === loc;
			}
		});
	}

	function validateMasterForm(): boolean {
		masterErrors = {};
		const lineErr = validateLine(masterPlanoForm.line);
		if (lineErr) {
			masterErrors.line = lineErr;
		} else if (isDuplicateLine(masterPlanoForm.line, masterEditMode ? masterEditId : undefined)) {
			masterErrors.line = `Line "${masterPlanoForm.line.toUpperCase()}" sudah digunakan`;
		}
		return Object.keys(masterErrors).length === 0;
	}

	function validateLinePlanoForm(): boolean {
		linePlanoErrors = {};
		if (!resolvedMaster) return false;

		const masterId = resolvedMaster.id;
		const editId = lineEditMode ? lineEditId : undefined;

		if (getTypeName(resolvedMaster.type_id) === 'RACK') {
			const rackErr = validateRack(linePlanoForm.rack);
			if (rackErr) linePlanoErrors.rack = rackErr;
			const shelfErr = validateShelf(linePlanoForm.shelf);
			if (shelfErr) linePlanoErrors.shelf = shelfErr;
			const cellErr = validateCell(linePlanoForm.cell);
			if (cellErr) linePlanoErrors.cell = cellErr;

			if (!linePlanoErrors.rack && !linePlanoErrors.shelf && !linePlanoErrors.cell) {
				if (
					isDuplicateLinePlanoInDB(
						masterId,
						linePlanoForm.rack,
						linePlanoForm.shelf,
						linePlanoForm.cell,
						'',
						editId
					)
				) {
					linePlanoErrors.rack = `Kombinasi Rack-Shelf-Cell ini sudah ada pada Line ${resolvedMaster.line}`;
				}
			}
		} else if (getTypeName(resolvedMaster.type_id) === 'FLOOR') {
			const locErr = validateLoc(linePlanoForm.loc);
			if (locErr) linePlanoErrors.loc = locErr;

			if (!linePlanoErrors.loc) {
				if (isDuplicateLinePlanoInDB(masterId, '', '', '', linePlanoForm.loc, editId)) {
					linePlanoErrors.loc = `Loc "${linePlanoForm.loc}" sudah ada pada Line ${resolvedMaster.line}`;
				}
			}
		}
		return Object.keys(linePlanoErrors).length === 0;
	}

	function validateTempLinePlano(): boolean {
		tempLinePlanoErrors = {};
		const isRack = getTypeName(masterPlanoForm.type_id) === 'RACK';

		if (isRack) {
			const rackErr = validateRack(tempLinePlano.rack);
			if (rackErr) tempLinePlanoErrors.rack = rackErr;
			const shelfErr = validateShelf(tempLinePlano.shelf);
			if (shelfErr) tempLinePlanoErrors.shelf = shelfErr;
			const cellErr = validateCell(tempLinePlano.cell);
			if (cellErr) tempLinePlanoErrors.cell = cellErr;

			if (!tempLinePlanoErrors.rack && !tempLinePlanoErrors.shelf && !tempLinePlanoErrors.cell) {
				if (
					isDuplicateInTempList(tempLinePlano.rack, tempLinePlano.shelf, tempLinePlano.cell, '')
				) {
					tempLinePlanoErrors.rack = 'Kombinasi Rack-Shelf-Cell ini sudah ditambahkan ke daftar';
				}
			}
		} else {
			const locErr = validateLoc(tempLinePlano.loc);
			if (locErr) tempLinePlanoErrors.loc = locErr;

			if (!tempLinePlanoErrors.loc) {
				if (isDuplicateInTempList('', '', '', tempLinePlano.loc)) {
					tempLinePlanoErrors.loc = `Loc "${tempLinePlano.loc}" sudah ditambahkan ke daftar`;
				}
			}
		}
		return Object.keys(tempLinePlanoErrors).length === 0;
	}

	// ===================== ENHANCE HANDLERS =====================

	// Digunakan di form Master Planogram (create & update)
	function enhanceMasterPlano() {
		const isEdit = masterEditMode;
		return ({ result, update }: any) => {
			update({ reset: false });
			if (result.type === 'success') {
				if (result.data?.success === false) {
					showError(result.data?.message || 'Terjadi kesalahan saat menyimpan data');
				} else {
					closeMasterPlanoModal();
					showSuccess(
						isEdit ? 'Master Planogram berhasil diupdate' : 'Master Planogram berhasil ditambahkan'
					);
				}
			} else if (result.type === 'failure') {
				showError(result.data?.message || 'Gagal menyimpan Master Planogram');
			} else {
				showError('Terjadi kesalahan yang tidak diketahui');
			}
		};
	}

	// Digunakan di form Line Planogram (create & update)
	function enhanceLinePlano() {
		const isEdit = lineEditMode;
		return ({ result, update }: any) => {
			update({ reset: false });
			if (result.type === 'success') {
				if (result.data?.success === false) {
					showError(result.data?.message || 'Terjadi kesalahan saat menyimpan lokasi');
				} else {
					closeLinePlanoModal();
					showSuccess(isEdit ? 'Lokasi berhasil diupdate' : 'Lokasi berhasil ditambahkan');
				}
			} else if (result.type === 'failure') {
				showError(result.data?.message || 'Gagal menyimpan lokasi');
			} else {
				showError('Terjadi kesalahan yang tidak diketahui');
			}
		};
	}

	// Digunakan di tombol hapus lokasi inline (di dalam accordion Master)
	function enhanceDeleteLinePlanoInline() {
		return ({ result, update }: any) => {
			update();
			if (result.type === 'success') {
				if (result.data?.success === false) {
					showError(result.data?.message || 'Gagal menghapus lokasi');
				} else {
					showSuccess('Lokasi berhasil dihapus');
				}
			} else {
				showError('Gagal menghapus lokasi');
			}
		};
	}

	// Digunakan di modal konfirmasi delete (Master & Line dari Tab 3)
	function enhanceDelete() {
		// Snapshot nilai saat tombol diklik karena deleteItem/deleteAction
		// bisa berubah setelah closeDeleteModal() dipanggil
		const action = deleteAction;
		const label =
			action === 'deleteMasterPlano'
				? `Planogram "${deleteItem?.line}"`
				: `Lokasi "${formatLinePlano(deleteItem || {})}"`;
		return ({ result, update }: any) => {
			update();
			closeDeleteModal();
			if (result.type === 'success') {
				if (result.data?.success === false) {
					showError(result.data?.message || `Gagal menghapus ${label}`);
				} else {
					showSuccess(`${label} berhasil dihapus`);
				}
			} else {
				showError(`Gagal menghapus ${label}`);
			}
		};
	}

	// ===================== LINE PLANO =====================
	let showLinePlanoModal = false;
	let lineEditMode = false;
	let lineEditId: string | null = null;
	let currentMasterPlano: any = null;

	let linePlanoForm = { master_id: '', rack: '', shelf: '', cell: '', loc: '' };

	// Search & Lazy Load for Line Plano tab
	let lineSearchQuery = '';
	let lineDisplayedItems = 10;
	let lineIsLoading = false;

	$: lineHasMore = filteredLinePlano.length > lineDisplayedItems;

	$: if (lineSearchQuery !== undefined) {
		lineDisplayedItems = 10;
	}

	$: filteredLinePlano =
		lineSearchQuery.trim() === ''
			? data.linePlano
			: data.linePlano.filter((item) => {
					const master = data.masterPlano.find((m) => m.id === item.master_id);
					const formatted = formatLinePlano(item).toLowerCase();
					return (
						formatted.includes(lineSearchQuery.toLowerCase()) ||
						(master?.line || '').toLowerCase().includes(lineSearchQuery.toLowerCase())
					);
				});

	$: displayedLinePlano = filteredLinePlano.slice(0, lineDisplayedItems);

	function loadMoreLine() {
		if (lineIsLoading || !lineHasMore) return;
		lineIsLoading = true;
		setTimeout(() => {
			lineDisplayedItems += 10;
			lineIsLoading = false;
		}, 300);
	}

	function handleLineScroll(event: any) {
		const el = event.target;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) loadMoreLine();
	}

	function openLinePlanoModal(master?: any, linePlano?: any) {
		if (master) currentMasterPlano = master;
		if (linePlano) {
			lineEditMode = true;
			lineEditId = linePlano.id;
			linePlanoForm = {
				master_id: linePlano.master_id,
				rack: linePlano.rack || '',
				shelf: linePlano.shelf || '',
				cell: linePlano.cell || '',
				loc: linePlano.loc || ''
			};
		} else {
			lineEditMode = false;
			lineEditId = null;
			linePlanoForm = {
				master_id: master?.id || '',
				rack: '',
				shelf: '',
				cell: '',
				loc: ''
			};
		}
		showLinePlanoModal = true;
	}

	function closeLinePlanoModal() {
		showLinePlanoModal = false;
		lineEditMode = false;
		lineEditId = null;
		currentMasterPlano = null;
		linePlanoErrors = {};
	}

	// ===================== CSV UPLOAD =====================
	let showCsvModal = false;
	let csvFileName = '';
	let csvPreviewRows: any[] = [];
	let csvIsProcessing = false;
	let csvUploadDone = false;
	let csvUploadResult: { success: number; failed: number } | null = null;

	type CsvRowStatus = 'valid' | 'error';
	interface CsvPreviewRow {
		rowNum: number;
		line: string;
		type: string;
		rack: string;
		shelf: string;
		cell: string;
		loc: string;
		master_id: any;
		status: CsvRowStatus;
		errors: string[];
	}

	function downloadCsvTemplate() {
		const header = 'line,rack,shelf,cell,loc';
		const examples = ['AA,01,1,1,', 'AA,01,1,2,', 'ZA,,,,1', 'ZA,,,,2'].join('\n');
		const content = header + '\n' + examples;
		const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'template_line_planogram.csv';
		a.click();
		URL.revokeObjectURL(url);
		showInfo('Template CSV berhasil diunduh');
	}

	function openCsvModal() {
		csvFileName = '';
		csvPreviewRows = [];
		csvUploadDone = false;
		csvUploadResult = null;
		showCsvModal = true;
	}

	function closeCsvModal() {
		showCsvModal = false;
		csvFileName = '';
		csvPreviewRows = [];
		csvUploadDone = false;
		csvUploadResult = null;
	}

	function handleCsvFile(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		csvFileName = file.name;
		csvPreviewRows = [];
		csvUploadDone = false;
		csvUploadResult = null;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			parseCsv(text);
		};
		reader.readAsText(file);
	}

	function parseCsv(text: string) {
		const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
		if (lines.length < 2) {
			csvPreviewRows = [];
			showWarning('File CSV kosong atau tidak memiliki data');
			return;
		}

		const dataLines = lines.slice(1).filter((l) => l.trim() !== '');
		const rows: CsvPreviewRow[] = [];

		for (let i = 0; i < dataLines.length; i++) {
			const cols = dataLines[i].split(',');
			const line = (cols[0] || '').trim().toUpperCase();
			const rack = (cols[1] || '').trim();
			const shelf = (cols[2] || '').trim();
			const cell = (cols[3] || '').trim();
			const loc = (cols[4] || '').trim();

			const errors: string[] = [];

			if (!line) {
				errors.push('Kolom "line" kosong');
			} else if (!/^[A-Z]{2}$/.test(line)) {
				errors.push(`Line "${line}" tidak valid (harus 2 huruf A-Z)`);
			}

			const master = data.masterPlano.find((m: any) => m.line === line);
			let masterId: any = null;
			let typeLabel = '-';

			if (line && /^[A-Z]{2}$/.test(line)) {
				if (!master) {
					errors.push(`Line "${line}" tidak ditemukan di Master Planogram`);
				} else {
					masterId = master.id;
					typeLabel = getTypeName(master.type_id);

					if (typeLabel === 'RACK') {
						if (!rack) {
							errors.push('Rack wajib diisi untuk type RACK');
						} else if (!/^\d{2}$/.test(rack)) {
							errors.push(`Rack "${rack}" tidak valid (harus 2 digit angka)`);
						}
						if (shelf && !/^[1-9]$/.test(shelf)) {
							errors.push(`Shelf "${shelf}" tidak valid (harus 1 digit 1-9)`);
						}
						if (cell && !/^([1-9]|[1-9]\d)$/.test(cell)) {
							errors.push(`Cell "${cell}" tidak valid (harus angka 1-99)`);
						}
						if (loc) {
							errors.push('Kolom "loc" harus kosong untuk type RACK');
						}
						if (errors.length === 0) {
							const dupDb = data.linePlano.some(
								(lp: any) =>
									lp.master_id === masterId &&
									lp.rack === rack &&
									(lp.shelf || '') === shelf &&
									(lp.cell || '') === cell
							);
							if (dupDb)
								errors.push(
									`Kombinasi R${rack}${shelf ? '-S' + shelf : ''}${cell ? '-C' + cell : ''} sudah ada di database`
								);
						}
					} else if (typeLabel === 'FLOOR') {
						if (!loc) {
							errors.push('Loc wajib diisi untuk type FLOOR');
						} else if (!/^([1-9]|[1-9]\d)$/.test(loc)) {
							errors.push(`Loc "${loc}" tidak valid (harus angka 1-99)`);
						}
						if (rack || shelf || cell) {
							errors.push('Kolom rack/shelf/cell harus kosong untuk type FLOOR');
						}
						if (errors.length === 0) {
							const dupDb = data.linePlano.some(
								(lp: any) => lp.master_id === masterId && lp.loc === loc
							);
							if (dupDb) errors.push(`Loc "${loc}" sudah ada di database untuk Line ${line}`);
						}
					}
				}
			}

			if (errors.length === 0 && masterId !== null) {
				const dupInFile = rows.some((r) => {
					if (r.master_id !== masterId || r.status === 'error') return false;
					if (typeLabel === 'RACK') {
						return r.rack === rack && r.shelf === shelf && r.cell === cell;
					} else {
						return r.loc === loc;
					}
				});
				if (dupInFile) errors.push('Duplikat dengan baris lain dalam file ini');
			}

			rows.push({
				rowNum: i + 2,
				line,
				type: typeLabel,
				rack,
				shelf,
				cell,
				loc,
				master_id: masterId,
				status: errors.length === 0 ? 'valid' : 'error',
				errors
			});
		}

		csvPreviewRows = rows;

		// Tampilkan ringkasan hasil parsing via alert
		const validCount = rows.filter((r) => r.status === 'valid').length;
		const errorCount = rows.filter((r) => r.status === 'error').length;

		if (errorCount === 0) {
			showInfo(`${validCount} baris siap diimport`);
		} else if (validCount === 0) {
			showError(`Semua ${errorCount} baris mengandung error. Perbaiki file CSV dan upload ulang`);
		} else {
			showWarning(`${validCount} baris valid, ${errorCount} baris error akan dilewati`);
		}
	}

	$: csvValidCount = csvPreviewRows.filter((r) => r.status === 'valid').length;
	$: csvErrorCount = csvPreviewRows.filter((r) => r.status === 'error').length;
	$: csvHasValidRows = csvValidCount > 0;

	async function submitCsvUpload() {
		const validRows = csvPreviewRows.filter((r) => r.status === 'valid');
		if (validRows.length === 0) return;

		csvIsProcessing = true;
		try {
			const formData = new FormData();
			formData.append('csv_data', JSON.stringify(validRows));

			const res = await fetch('?/importLinePlanoCsv', {
				method: 'POST',
				body: formData
			});

			const result = await res.json();
			const inserted = result.data?.inserted ?? validRows.length;
			const skipped = result.data?.skipped ?? 0;

			csvUploadDone = true;
			csvUploadResult = { success: inserted, failed: skipped };

			if (inserted > 0 && skipped === 0) {
				showSuccess(`${inserted} lokasi berhasil diimport`);
			} else if (inserted > 0 && skipped > 0) {
				showWarning(`${inserted} lokasi berhasil diimport, ${skipped} dilewati`);
			} else {
				showError('Import gagal, tidak ada data yang tersimpan');
			}
		} catch (err) {
			console.error(err);
			showError('Terjadi kesalahan saat mengimport CSV');
		} finally {
			csvIsProcessing = false;
		}
	}

	// ===================== HELPERS =====================
	function getTypeName(id: string) {
		return data.typePlano.find((t) => t.id === id)?.type || '-';
	}

	function getLinePlanoByMaster(masterId: string) {
		return data.linePlano.filter((l) => l.master_id === masterId);
	}

	function formatLinePlano(linePlano: any) {
		if (linePlano.rack) {
			return `R${linePlano.rack}${linePlano.shelf ? '-S' + linePlano.shelf : ''}${linePlano.cell ? '-C' + linePlano.cell : ''}`;
		} else if (linePlano.loc) {
			return `LOC-${linePlano.loc}`;
		}
		return '-';
	}

	$: resolvedMaster =
		currentMasterPlano ||
		(linePlanoForm.master_id
			? data.masterPlano.find((m) => m.id === linePlanoForm.master_id)
			: null);
</script>

<Card size="xl" class="max-w-none p-4 shadow-sm sm:p-6">
	<div class="mb-4">
		<Heading tag="h3" class="text-xl font-semibold dark:text-white mb-4">Planogram ATK</Heading>

		<Tabs style="underline">
			<!-- ============================= TAB 1: TYPE PLANO ============================= -->
			<TabItem open title="Type Planogram">
				<div class="mt-4">
					<div class="mb-4 flex items-center gap-2">
						<TagOutline class="h-5 w-5 text-blue-600" />
						<span class="font-semibold text-gray-700 dark:text-gray-300">
							{data.typePlano.length} Tipe tersedia
						</span>
					</div>

					{#if data.typePlano.length === 0}
						<div class="text-center py-12 text-gray-500 dark:text-gray-400">
							<TagOutline class="mx-auto h-12 w-12 mb-3 opacity-50" />
							<p class="text-lg font-medium">Belum ada type planogram</p>
						</div>
					{:else}
						<div class="space-y-2">
							{#each data.typePlano as type, index}
								<div
									class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
								>
									<div
										class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm flex-shrink-0"
									>
										{index + 1}
									</div>
									<div>
										<span class="font-semibold text-gray-900 dark:text-white">{type.type}</span>
										<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
											ID: {type.id} &bull;
											{data.masterPlano.filter((m) => m.type_id === type.id).length} master planogram
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</TabItem>

			<!-- ============================= TAB 2: MASTER PLANO ============================= -->
			<TabItem title="Master Planogram">
				<div class="mt-4">
					<div
						class="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
					>
						<div></div>
						<Button onclick={() => openMasterPlanoModal()} color="blue" size="sm">
							<PlusOutline class="me-2 h-4 w-4" />
							Tambah Planogram
						</Button>
					</div>

					<div class="mb-4">
						<Search
							placeholder="Cari berdasarkan line atau type..."
							bind:value={masterSearchQuery}
							size="md"
						/>
					</div>

					<div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
						Menampilkan {displayedMasterPlano.length} dari {filteredMasterPlano.length} planogram
						{#if masterSearchQuery}
							<Badge color="blue" class="ml-2">Pencarian: "{masterSearchQuery}"</Badge>
						{/if}
					</div>

					<div class="space-y-2 max-h-[600px] overflow-y-auto pr-2" onscroll={handleMasterScroll}>
						{#if displayedMasterPlano.length === 0}
							<div class="text-center py-12 text-gray-500 dark:text-gray-400">
								<MapPinOutline class="mx-auto h-12 w-12 mb-3 opacity-50" />
								<p class="text-lg font-medium">Tidak ada planogram ditemukan</p>
								{#if masterSearchQuery}
									<p class="text-sm">Coba gunakan kata kunci lain</p>
								{/if}
							</div>
						{:else}
							{#each displayedMasterPlano as item, index}
								<Accordion>
									<AccordionItem>
										{#snippet header()}
											<span slot="header" class="flex items-center justify-between w-full">
												<div class="flex items-center gap-3 flex-1">
													<div
														class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold"
													>
														{index + 1}
													</div>
													{#if getTypeName(item.type_id) === 'RACK'}
														<GridOutline
															class="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0"
														/>
													{:else}
														<MapPinOutline
															class="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
														/>
													{/if}
													<div class="flex-1 min-w-0">
														<div class="flex flex-wrap items-center gap-2 mb-1">
															<span class="font-semibold text-gray-900 dark:text-white">
																Line: {item.line}
															</span>
															<Badge
																color={getTypeName(item.type_id) === 'RACK' ? 'green' : 'purple'}
															>
																{getTypeName(item.type_id)}
															</Badge>
														</div>
														<div class="text-xs text-gray-500 dark:text-gray-400">
															{getLinePlanoByMaster(item.id).length} lokasi
														</div>
													</div>
												</div>
												<div class="flex gap-2 mr-2" onclick={(e) => e.stopPropagation()}>
													<Button
														size="xs"
														color="yellow"
														onclick={() => openMasterPlanoModal(item)}
													>
														<EditOutline class="h-4 w-4" />
													</Button>
													<Button
														size="xs"
														color="red"
														onclick={() => confirmDelete(item, 'deleteMasterPlano')}
													>
														<TrashBinOutline class="h-4 w-4" />
													</Button>
												</div>
											</span>
										{/snippet}

										<div class="space-y-4 p-4 bg-gray-50 dark:bg-gray-800">
											<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<Label class="text-xs text-gray-500 dark:text-gray-400">Line</Label>
													<div class="font-medium text-gray-900 dark:text-white">{item.line}</div>
												</div>
												<div>
													<Label class="text-xs text-gray-500 dark:text-gray-400">Type</Label>
													<div class="font-medium text-gray-900 dark:text-white">
														{getTypeName(item.type_id)}
													</div>
												</div>
											</div>

											<hr class="border-gray-200 dark:border-gray-700" />

											<div>
												<div class="flex items-center justify-between mb-3">
													<h4 class="font-semibold text-gray-900 dark:text-white">Lokasi</h4>
													<Button size="xs" color="blue" onclick={() => openLinePlanoModal(item)}>
														<PlusOutline class="h-3 w-3 me-1" />
														Tambah Lokasi
													</Button>
												</div>

												{#if getLinePlanoByMaster(item.id).length > 0}
													<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
														{#each getLinePlanoByMaster(item.id) as lp}
															<div
																class="border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 flex items-center justify-between"
															>
																<Badge color={lp.rack ? 'green' : 'purple'} class="text-xs">
																	{formatLinePlano(lp)}
																</Badge>
																<div class="flex gap-1">
																	<Button
																		size="xs"
																		color="yellow"
																		onclick={() => openLinePlanoModal(item, lp)}
																	>
																		<EditOutline class="h-3 w-3" />
																	</Button>
																	<!-- Hapus inline: pakai enhanceDeleteLinePlanoInline -->
																	<form
																		method="POST"
																		action="?/deleteLinePlano"
																		use:enhance={enhanceDeleteLinePlanoInline}
																	>
																		<input type="hidden" name="id" value={lp.id} />
																		<Button size="xs" color="red" type="submit">
																			<TrashBinOutline class="h-3 w-3" />
																		</Button>
																	</form>
																</div>
															</div>
														{/each}
													</div>
												{:else}
													<p class="text-sm text-gray-500 dark:text-gray-400 italic">
														Belum ada lokasi
													</p>
												{/if}
											</div>
										</div>
									</AccordionItem>
								</Accordion>
							{/each}

							{#if masterIsLoading}
								<div class="flex justify-center py-4">
									<Spinner size="6" color="blue" />
								</div>
							{/if}

							{#if masterHasMore && !masterIsLoading}
								<div class="flex justify-center py-4">
									<Button color="light" onclick={loadMoreMaster}>Muat Lebih Banyak</Button>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</TabItem>

			<!-- ============================= TAB 3: LINE PLANO ============================= -->
			<TabItem title="Line Planogram">
				<div class="mt-4">
					<div class="mb-4 flex items-center justify-between gap-2">
						<div></div>
						<div class="flex gap-2">
							<Button onclick={openCsvModal} color="green" size="sm">
								<UploadOutline class="me-2 h-4 w-4" />
								Upload CSV
							</Button>
							<Button onclick={() => openLinePlanoModal()} color="blue" size="sm">
								<PlusOutline class="me-2 h-4 w-4" />
								Tambah Lokasi
							</Button>
						</div>
					</div>

					<div class="mb-4">
						<Search
							placeholder="Cari berdasarkan line atau lokasi..."
							bind:value={lineSearchQuery}
							size="md"
						/>
					</div>

					<div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
						Menampilkan {displayedLinePlano.length} dari {filteredLinePlano.length} lokasi
						{#if lineSearchQuery}
							<Badge color="blue" class="ml-2">Pencarian: "{lineSearchQuery}"</Badge>
						{/if}
					</div>

					<div class="space-y-2 max-h-[600px] overflow-y-auto pr-2" onscroll={handleLineScroll}>
						{#if displayedLinePlano.length === 0}
							<div class="text-center py-12 text-gray-500 dark:text-gray-400">
								<ListOutline class="mx-auto h-12 w-12 mb-3 opacity-50" />
								<p class="text-lg font-medium">Tidak ada lokasi ditemukan</p>
								{#if lineSearchQuery}
									<p class="text-sm">Coba gunakan kata kunci lain</p>
								{/if}
							</div>
						{:else}
							{#each displayedLinePlano as lp, index}
								{@const master = data.masterPlano.find((m) => m.id === lp.master_id)}
								<div
									class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
								>
									<div class="flex items-center gap-3">
										<div
											class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm"
										>
											{index + 1}
										</div>
										<div>
											<div class="flex items-center gap-2">
												<Badge color={lp.rack ? 'green' : 'purple'} class="text-xs font-mono">
													{formatLinePlano(lp)}
												</Badge>
												<span class="text-xs text-gray-500 dark:text-gray-400">
													Line: <span class="font-semibold text-gray-700 dark:text-gray-200"
														>{master?.line || '-'}</span
													>
												</span>
												<Badge
													color={getTypeName(master?.type_id || '') === 'RACK' ? 'green' : 'purple'}
													class="text-xs"
												>
													{getTypeName(master?.type_id || '')}
												</Badge>
											</div>
											<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
												{#if lp.rack}
													Rack: {lp.rack}{lp.shelf ? ` · Shelf: ${lp.shelf}` : ''}{lp.cell
														? ` · Cell: ${lp.cell}`
														: ''}
												{:else if lp.loc}
													Loc: {lp.loc}
												{/if}
											</div>
										</div>
									</div>
									<div class="flex gap-2">
										<Button size="xs" color="yellow" onclick={() => openLinePlanoModal(master, lp)}>
											<EditOutline class="h-4 w-4" />
										</Button>
										<Button
											size="xs"
											color="red"
											onclick={() => confirmDelete(lp, 'deleteLinePlano')}
										>
											<TrashBinOutline class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/each}

							{#if lineIsLoading}
								<div class="flex justify-center py-4">
									<Spinner size="6" color="blue" />
								</div>
							{/if}

							{#if lineHasMore && !lineIsLoading}
								<div class="flex justify-center py-4">
									<Button color="light" onclick={loadMoreLine}>Muat Lebih Banyak</Button>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</TabItem>
		</Tabs>
	</div>
</Card>

<!-- ===================== MODAL: MASTER PLANOGRAM ===================== -->
<Modal bind:open={showMasterPlanoModal} size="lg" autoclose={false}>
	<form
		method="POST"
		action="?/{masterEditMode ? 'updateMasterPlano' : 'createMasterPlano'}"
		use:enhance={enhanceMasterPlano}
		onsubmit={(e) => {
			if (!validateMasterForm()) {
				e.preventDefault();
			}
		}}
	>
		{#if masterEditMode}
			<input type="hidden" name="id" value={masterEditId} />
		{/if}

		{#if !masterEditMode}
			<input type="hidden" name="linePlano_data" value={JSON.stringify(linePlanoList)} />
		{/if}

		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{masterEditMode ? 'Edit' : 'Tambah'} Planogram
		</h3>

		<div class="mb-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Label>
					Type
					{#if masterEditMode}
						<div
							class="mt-1 flex items-center gap-2 p-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
						>
							<Badge color={getTypeName(masterPlanoForm.type_id) === 'RACK' ? 'green' : 'purple'}>
								{getTypeName(masterPlanoForm.type_id)}
							</Badge>
							<span class="text-xs text-gray-500 dark:text-gray-400 italic"
								>(tidak dapat diubah)</span
							>
						</div>
						<input type="hidden" name="type_id" value={masterPlanoForm.type_id} />
					{:else}
						<select
							name="type_id"
							bind:value={masterPlanoForm.type_id}
							required
							onchange={handleTypeChange}
							class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value="">Pilih Type</option>
							{#each data.typePlano as type}
								<option value={type.id}>{type.type}</option>
							{/each}
						</select>
					{/if}
				</Label>

				<Label>
					Line
					<Input
						name="line"
						bind:value={masterPlanoForm.line}
						required
						maxlength={2}
						class="mt-1 uppercase {masterErrors.line
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: ''}"
						placeholder="AA, AB, ZA, dll"
						oninput={() => {
							masterPlanoForm.line = masterPlanoForm.line.toUpperCase();
							masterErrors.line = validateLine(masterPlanoForm.line);
						}}
					/>
					{#if masterErrors.line}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">{masterErrors.line}</p>
					{/if}
				</Label>
			</div>
		</div>

		{#if !masterEditMode}
			<div class="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
				<h4 class="mb-3 font-semibold text-gray-900 dark:text-white">Lokasi (Opsional)</h4>

				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
					{#if getTypeName(masterPlanoForm.type_id) === 'RACK'}
						<div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
							<Label>
								Rack <span class="text-red-500">*</span>
								<Input
									bind:value={tempLinePlano.rack}
									maxlength={2}
									class="mt-1 {tempLinePlanoErrors.rack ? 'border-red-500' : ''}"
									placeholder="01"
									oninput={() => {
										tempLinePlanoErrors.rack = validateRack(tempLinePlano.rack);
									}}
								/>
								{#if tempLinePlanoErrors.rack}
									<p class="mt-1 text-xs text-red-600 dark:text-red-400">
										{tempLinePlanoErrors.rack}
									</p>
								{/if}
							</Label>
							<Label>
								Shelf
								<Input
									bind:value={tempLinePlano.shelf}
									maxlength={1}
									class="mt-1 {tempLinePlanoErrors.shelf ? 'border-red-500' : ''}"
									placeholder="1"
									oninput={() => {
										tempLinePlanoErrors.shelf = validateShelf(tempLinePlano.shelf);
									}}
								/>
								{#if tempLinePlanoErrors.shelf}
									<p class="mt-1 text-xs text-red-600 dark:text-red-400">
										{tempLinePlanoErrors.shelf}
									</p>
								{/if}
							</Label>
							<Label>
								Cell
								<Input
									bind:value={tempLinePlano.cell}
									maxlength={2}
									class="mt-1 {tempLinePlanoErrors.cell ? 'border-red-500' : ''}"
									placeholder="1"
									oninput={() => {
										tempLinePlanoErrors.cell = validateCell(tempLinePlano.cell);
									}}
								/>
								{#if tempLinePlanoErrors.cell}
									<p class="mt-1 text-xs text-red-600 dark:text-red-400">
										{tempLinePlanoErrors.cell}
									</p>
								{/if}
							</Label>
						</div>
					{:else if getTypeName(masterPlanoForm.type_id) === 'FLOOR'}
						<div class="mb-3">
							<Label>
								Loc <span class="text-red-500">*</span>
								<Input
									bind:value={tempLinePlano.loc}
									class="mt-1 {tempLinePlanoErrors.loc ? 'border-red-500' : ''}"
									placeholder="1"
									oninput={() => {
										tempLinePlanoErrors.loc = validateLoc(tempLinePlano.loc);
									}}
								/>
								{#if tempLinePlanoErrors.loc}
									<p class="mt-1 text-xs text-red-600 dark:text-red-400">
										{tempLinePlanoErrors.loc}
									</p>
								{/if}
							</Label>
						</div>
					{:else}
						<p class="text-sm text-gray-500 dark:text-gray-400 italic">
							Pilih type terlebih dahulu
						</p>
					{/if}

					{#if masterPlanoForm.type_id}
						<Button size="sm" color="blue" onclick={addLinePlanoToList} type="button">
							<PlusOutline class="h-3 w-3 me-1" />
							Tambah Lokasi
						</Button>
					{/if}
				</div>

				{#if linePlanoList.length > 0}
					<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
						{#each linePlanoList as lp, index}
							<div
								class="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2"
							>
								<Badge color={lp.rack ? 'green' : 'purple'} class="text-xs">
									{formatLinePlano(lp)}
								</Badge>
								<Button
									size="xs"
									color="red"
									onclick={() => removeLinePlanoFromList(index)}
									type="button"
								>
									<TrashBinOutline class="h-3 w-3" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
			<Button type="submit" color="blue">
				{masterEditMode ? 'Update' : 'Simpan'} Planogram
			</Button>
			<Button color="alternative" onclick={closeMasterPlanoModal} type="button">Batal</Button>
		</div>
	</form>
</Modal>

<!-- ===================== MODAL: LINE PLANOGRAM ===================== -->
<Modal bind:open={showLinePlanoModal} size="sm" autoclose={false}>
	<form
		method="POST"
		action="?/{lineEditMode ? 'updateLinePlano' : 'createLinePlano'}"
		use:enhance={enhanceLinePlano}
		onsubmit={(e) => {
			if (!validateLinePlanoForm()) {
				e.preventDefault();
			}
		}}
	>
		{#if lineEditMode}
			<input type="hidden" name="id" value={lineEditId} />
		{/if}
		<input type="hidden" name="master_id" value={linePlanoForm.master_id} />

		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
			{lineEditMode ? 'Edit' : 'Tambah'} Lokasi
		</h3>

		{#if !lineEditMode}
			{#if !currentMasterPlano}
				<div class="mb-4">
					<Label>
						Master Planogram
						<select
							bind:value={linePlanoForm.master_id}
							required
							class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value="">Pilih Planogram</option>
							{#each data.masterPlano as master}
								<option value={master.id}>Line {master.line} ({getTypeName(master.type_id)})</option
								>
							{/each}
						</select>
					</Label>
				</div>
			{:else}
				<div
					class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700"
				>
					<p class="text-sm text-blue-800 dark:text-blue-300">
						Master: <span class="font-semibold">Line {currentMasterPlano.line}</span>
						({getTypeName(currentMasterPlano.type_id)})
					</p>
				</div>
			{/if}
		{/if}

		{#if resolvedMaster && getTypeName(resolvedMaster.type_id) === 'RACK'}
			<div class="grid grid-cols-2 gap-3 mb-4">
				<Label>
					Rack <span class="text-red-500">*</span>
					<Input
						name="rack"
						bind:value={linePlanoForm.rack}
						required
						maxlength={2}
						class="mt-1 {linePlanoErrors.rack
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: ''}"
						placeholder="01"
						oninput={() => {
							linePlanoErrors.rack = validateRack(linePlanoForm.rack);
						}}
					/>
					{#if linePlanoErrors.rack}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">{linePlanoErrors.rack}</p>
					{/if}
				</Label>
				<Label>
					Shelf
					<Input
						name="shelf"
						bind:value={linePlanoForm.shelf}
						maxlength={1}
						class="mt-1 {linePlanoErrors.shelf
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: ''}"
						placeholder="1"
						oninput={() => {
							linePlanoErrors.shelf = validateShelf(linePlanoForm.shelf);
						}}
					/>
					{#if linePlanoErrors.shelf}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">{linePlanoErrors.shelf}</p>
					{/if}
				</Label>
				<Label>
					Cell
					<Input
						name="cell"
						bind:value={linePlanoForm.cell}
						maxlength={2}
						class="mt-1 {linePlanoErrors.cell
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: ''}"
						placeholder="1"
						oninput={() => {
							linePlanoErrors.cell = validateCell(linePlanoForm.cell);
						}}
					/>
					{#if linePlanoErrors.cell}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">{linePlanoErrors.cell}</p>
					{/if}
				</Label>
			</div>
		{:else if resolvedMaster && getTypeName(resolvedMaster.type_id) === 'FLOOR'}
			<Label class="mb-4">
				Loc <span class="text-red-500">*</span>
				<Input
					name="loc"
					bind:value={linePlanoForm.loc}
					required
					class="mt-1 {linePlanoErrors.loc
						? 'border-red-500 focus:border-red-500 focus:ring-red-500'
						: ''}"
					placeholder="1"
					oninput={() => {
						linePlanoErrors.loc = validateLoc(linePlanoForm.loc);
					}}
				/>
				{#if linePlanoErrors.loc}
					<p class="mt-1 text-xs text-red-600 dark:text-red-400">{linePlanoErrors.loc}</p>
				{/if}
			</Label>
		{:else if !resolvedMaster}
			<p class="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
				Pilih master planogram terlebih dahulu
			</p>
		{/if}

		<div class="flex gap-2">
			<Button type="submit" color="blue">Simpan</Button>
			<Button color="alternative" onclick={closeLinePlanoModal} type="button">Batal</Button>
		</div>
	</form>
</Modal>

<!-- ===================== MODAL: UPLOAD CSV LINE PLANOGRAM ===================== -->
<Modal bind:open={showCsvModal} size="xl" autoclose={false}>
	<div class="flex items-center gap-3 mb-5">
		<div
			class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0"
		>
			<UploadOutline class="h-5 w-5 text-green-600 dark:text-green-400" />
		</div>
		<div>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Upload CSV Line Planogram</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Import data lokasi secara massal dari file CSV
			</p>
		</div>
	</div>

	{#if !csvUploadDone}
		<div
			class="mb-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
		>
			<div class="flex items-start gap-3">
				<div class="mt-0.5 flex-shrink-0">
					<svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="text-sm text-blue-800 dark:text-blue-300">
					<p class="font-semibold mb-1">Format CSV yang diterima:</p>
					<p
						class="font-mono bg-blue-100 dark:bg-blue-900/40 rounded px-2 py-1 text-xs inline-block mb-2"
					>
						line, rack, shelf, cell, loc
					</p>
					<ul class="space-y-1 text-xs">
						<li>
							• <strong>line</strong>: 2 huruf kapital, harus ada di Master Planogram (contoh: AA,
							ZA)
						</li>
						<li>
							• Type <strong>RACK</strong>: isi
							<code class="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">rack</code>
							(wajib, 2 digit),
							<code class="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">shelf</code>
							& <code class="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">cell</code> opsional.
							Biarkan
							<code class="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">loc</code> kosong.
						</li>
						<li>
							• Type <strong>FLOOR</strong>: isi
							<code class="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">loc</code> (wajib, angka 1–99).
							Biarkan rack/shelf/cell kosong.
						</li>
					</ul>
					<button
						type="button"
						onclick={downloadCsvTemplate}
						class="mt-2 flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:underline"
					>
						<DownloadOutline class="h-3.5 w-3.5" />
						Download Template CSV
					</button>
				</div>
			</div>
		</div>

		<div class="mb-5">
			<label
				class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				for="csv-file-input"
			>
				{#if csvFileName}
					<div class="flex flex-col items-center text-green-600 dark:text-green-400">
						<svg class="h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-semibold text-sm">{csvFileName}</span>
						<span class="text-xs text-gray-500 mt-0.5">Klik untuk ganti file</span>
					</div>
				{:else}
					<div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
						<UploadOutline class="h-8 w-8 mb-2" />
						<span class="font-semibold text-sm">Klik atau seret file CSV ke sini</span>
						<span class="text-xs mt-1">Hanya file .csv</span>
					</div>
				{/if}
			</label>
			<input
				id="csv-file-input"
				type="file"
				accept=".csv,text/csv"
				class="hidden"
				onchange={handleCsvFile}
			/>
		</div>

		{#if csvPreviewRows.length > 0}
			<div class="mb-5">
				<div class="flex items-center gap-3 mb-3">
					<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
						Preview: {csvPreviewRows.length} baris
					</span>
					{#if csvValidCount > 0}
						<Badge color="green">
							<CheckCircleOutline class="h-3 w-3 me-1" />
							{csvValidCount} valid
						</Badge>
					{/if}
					{#if csvErrorCount > 0}
						<Badge color="red">
							<CloseCircleOutline class="h-3 w-3 me-1" />
							{csvErrorCount} error
						</Badge>
					{/if}
				</div>

				<div
					class="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
				>
					<table class="w-full text-xs text-left">
						<thead
							class="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
						>
							<tr>
								<th class="px-3 py-2">#</th>
								<th class="px-3 py-2">Line</th>
								<th class="px-3 py-2">Type</th>
								<th class="px-3 py-2">Rack</th>
								<th class="px-3 py-2">Shelf</th>
								<th class="px-3 py-2">Cell</th>
								<th class="px-3 py-2">Loc</th>
								<th class="px-3 py-2">Status</th>
							</tr>
						</thead>
						<tbody>
							{#each csvPreviewRows as row}
								<tr
									class="border-t border-gray-200 dark:border-gray-700 {row.status === 'error'
										? 'bg-red-50 dark:bg-red-900/20'
										: 'bg-white dark:bg-gray-800'}"
								>
									<td class="px-3 py-2 text-gray-400">{row.rowNum}</td>
									<td class="px-3 py-2 font-mono font-semibold">{row.line || '-'}</td>
									<td class="px-3 py-2">
										{#if row.type !== '-'}
											<Badge color={row.type === 'RACK' ? 'green' : 'purple'} class="text-xs"
												>{row.type}</Badge
											>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
									<td class="px-3 py-2 font-mono">{row.rack || '-'}</td>
									<td class="px-3 py-2 font-mono">{row.shelf || '-'}</td>
									<td class="px-3 py-2 font-mono">{row.cell || '-'}</td>
									<td class="px-3 py-2 font-mono">{row.loc || '-'}</td>
									<td class="px-3 py-2">
										{#if row.status === 'valid'}
											<div class="flex items-center gap-1 text-green-600 dark:text-green-400">
												<CheckCircleOutline class="h-3.5 w-3.5 flex-shrink-0" />
												<span class="text-xs">Valid</span>
											</div>
										{:else}
											<div>
												<div class="flex items-center gap-1 text-red-600 dark:text-red-400 mb-0.5">
													<CloseCircleOutline class="h-3.5 w-3.5 flex-shrink-0" />
													<span class="text-xs font-semibold">Error</span>
												</div>
												{#each row.errors as err}
													<p class="text-xs text-red-500 dark:text-red-400 leading-tight">{err}</p>
												{/each}
											</div>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if csvErrorCount > 0 && csvValidCount > 0}
					<p class="mt-2 text-xs text-amber-600 dark:text-amber-400">
						⚠️ Hanya {csvValidCount} baris valid yang akan diimport. Baris error akan dilewati.
					</p>
				{:else if csvErrorCount > 0 && csvValidCount === 0}
					<p class="mt-2 text-xs text-red-600 dark:text-red-400">
						❌ Semua baris mengandung error. Perbaiki file CSV dan upload ulang.
					</p>
				{/if}
			</div>
		{/if}

		<div class="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
			<Button
				color="green"
				disabled={!csvHasValidRows || csvIsProcessing}
				onclick={submitCsvUpload}
			>
				{#if csvIsProcessing}
					<Spinner size="4" color="white" class="me-2" />
					Mengimport...
				{:else}
					<UploadOutline class="me-2 h-4 w-4" />
					Import {csvValidCount > 0 ? `${csvValidCount} Baris` : ''}
				{/if}
			</Button>
			<Button color="alternative" onclick={closeCsvModal} type="button">Batal</Button>
		</div>
	{:else}
		<div class="text-center py-8">
			<div
				class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4"
			>
				<CheckCircleOutline class="h-8 w-8 text-green-600 dark:text-green-400" />
			</div>
			<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import Selesai!</h4>

			<div class="flex justify-center gap-4 mb-6">
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600 dark:text-green-400">
						{csvUploadResult?.success ?? 0}
					</div>
					<div class="text-xs text-gray-500">Berhasil diimport</div>
				</div>
				{#if (csvUploadResult?.failed ?? 0) > 0}
					<div class="text-center">
						<div class="text-2xl font-bold text-red-500">{csvUploadResult?.failed}</div>
						<div class="text-xs text-gray-500">Dilewati</div>
					</div>
				{/if}
			</div>

			<div class="flex justify-center gap-2">
				<Button
					color="green"
					onclick={() => {
						closeCsvModal();
						window.location.reload();
					}}
				>
					Selesai & Refresh
				</Button>
				<Button color="alternative" onclick={openCsvModal}>Upload Lagi</Button>
			</div>
		</div>
	{/if}
</Modal>

<!-- ===================== MODAL: KONFIRMASI DELETE ===================== -->
<Modal bind:open={showDeleteModal} size="xs" autoclose={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			{#if deleteAction === 'deleteMasterPlano'}
				Apakah Anda yakin ingin menghapus planogram
				<span class="font-semibold">"{deleteItem?.line}"</span>?
			{:else}
				Apakah Anda yakin ingin menghapus lokasi
				<span class="font-semibold">"{formatLinePlano(deleteItem || {})}"</span>?
			{/if}
		</h3>
		<p class="mb-5 text-sm text-gray-400 dark:text-gray-500">
			{#if deleteAction === 'deleteMasterPlano'}
				Data yang sudah dihapus tidak dapat dikembalikan. Ini juga akan menghapus semua lokasi
				terkait.
			{:else}
				Data yang sudah dihapus tidak dapat dikembalikan.
			{/if}
		</p>
		<form method="POST" action="?/{deleteAction}" use:enhance={enhanceDelete}>
			<input type="hidden" name="id" value={deleteItem?.id} />
			<div class="flex justify-center gap-4">
				<Button color="red" type="submit">Ya, Hapus</Button>
				<Button color="alternative" onclick={closeDeleteModal} type="button">Batal</Button>
			</div>
		</form>
	</div>
</Modal>
