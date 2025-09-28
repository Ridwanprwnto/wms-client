<script>
	export let form;
	import { enhance } from '$app/forms';
	import { Button, Label, Input, Checkbox, Card } from 'flowbite-svelte';
	import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
	import { handleApiResponse } from '$lib/utils/alertUtils.js';

	let username = '';
	let password = '';
	let rememberMe = false;
	let showPassword = false;

	// Contoh data statis untuk versi aplikasi
	const appVersion = '1.0.0';
	const currentYear = new Date().getFullYear();

	$: {
		if (form?.error) {
			handleApiResponse({ error: form.error }, 'Login berhasil', 'Login gagal');
		}
	}
</script>

<svelte:head>
	<title>Login - Warehouse Management System</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
	<Card class="w-full max-w-sm p-6 space-y-6">
		<div class="text-center">
			<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">WMS</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300 mb-2">Warehouse Management System</p>
		</div>

		<form method="POST" class="space-y-4" use:enhance>
			<div>
				<Label for="username" class="mb-2">Username</Label>
				<Input
					type="text"
					id="username"
					name="username"
					placeholder="Masukkan username"
					bind:value={username}
					required
					autocomplete="username"
					class="w-full"
				/>
			</div>

			<div>
				<Label for="password" class="mb-2">Password</Label>
				<div class="relative">
					<Input
						type={showPassword ? 'text' : 'password'}
						id="password"
						name="password"
						placeholder="Masukkan password"
						bind:value={password}
						required
						autocomplete="current-password"
						class="w-full"
					/>
					<button
						type="button"
						class="absolute inset-y-0 right-0 pr-3 flex items-center"
						on:click={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeSlashOutline class="w-5 h-5 text-gray-500" />
						{:else}
							<EyeOutline class="w-5 h-5 text-gray-500" />
						{/if}
					</button>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<Checkbox bind:checked={rememberMe}>Ingat saya</Checkbox>
			</div>

			<Button type="submit" class="w-full" size="lg">Masuk</Button>
		</form>

		<footer
			class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700"
		>
			<p>&copy; {currentYear} WMS Developed by Purwanto Ridwan.</p>
			<p>Version: {appVersion}</p>
		</footer>
	</Card>
</div>
