// src/lib/stores/themeStore.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Function to get initial dark mode preference
function getInitialDarkMode() {
	if (!browser) return false;

	// Check localStorage first
	const stored = localStorage.getItem('darkMode');
	if (stored !== null) {
		return JSON.parse(stored);
	}

	// Fall back to system preference
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Create the store
export const isDarkMode = writable(getInitialDarkMode());

// Function to toggle dark mode
export function toggleDarkMode() {
	isDarkMode.update((current) => {
		const newValue = !current;

		if (browser) {
			// Update localStorage
			localStorage.setItem('darkMode', JSON.stringify(newValue));

			// Update document class
			if (newValue) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}

		return newValue;
	});
}

// Function to initialize dark mode on app start
export function initializeDarkMode() {
	if (!browser) return;

	isDarkMode.subscribe((isDark) => {
		// Update document class when store changes
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', (e) => {
		// Only update if no manual preference is stored
		const stored = localStorage.getItem('darkMode');
		if (stored === null) {
			isDarkMode.set(e.matches);
		}
	});
}
