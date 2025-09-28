import { env } from '$env/dynamic/private';

/**
 * Memanggil API login authentication.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, token?: string, message?: string }>}}
 */
export async function loginService(username, password) {
	try {
		const res = await fetch(`${env.API_BASE_URL}${env.API_PATH_AUTH}/users/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		const text = await res.text();

		let data;
		try {
			data = JSON.parse(text);
		} catch {
			data = null;
		}

		if (!res.ok) {
			return {
				success: false,
				message: data?.message || `Login gagal (${res.status})`
			};
		}

		if (data?.success === false) {
			return { success: false, message: data.message || 'Login gagal' };
		}

		return { success: true, token: data?.token, user: data?.user };
	} catch (err) {
		return { success: false, message: err.message };
	}
}
