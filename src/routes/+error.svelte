<script>
	import { Button } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<title>{$page.status} - {$page.error?.message}</title>
</svelte:head>

<div
	class="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
>
	<div class="mb-6">
		<ExclamationCircleOutline
			class="w-24 h-24 mx-auto text-red-500 dark:text-red-400 animate-pulse"
		/>
	</div>

	<h1 class="text-7xl font-bold mb-4">{$page.status}</h1>
	<p class="text-2xl font-semibold mb-2">Oops, terjadi kesalahan!</p>
	<p class="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-6">
		{$page.error?.message ||
			'Halaman yang Anda cari tidak ditemukan atau telah terjadi kesalahan server.'}
	</p>

	<div class="flex flex-col sm:flex-row gap-4 mt-4">
		<Button href="/" color="primary" class="font-medium text-lg px-6">Kembali ke Beranda</Button>
		<Button
			onClick={() => goto('/')}
			color="alternative"
			class="cursor-pointer font-medium text-lg px-6">Muat Ulang Halaman</Button
		>
	</div>
</div>
