import { redirect } from '@sveltejs/kit';

export function load() {
	// redirect ke /dashboard setiap kali buka /
	throw redirect(307, '/dashboard');
}
