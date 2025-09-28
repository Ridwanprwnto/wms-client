// src/routes/(main)/+layout.server.js
export async function load({ cookies, locals }) {
	// Get user info from cookies or locals (set by hooks.server.js)
	let user = locals.user || null;

	// If not in locals, try to get from cookie
	if (!user) {
		const userCookie = cookies.get('user');
		if (userCookie) {
			try {
				user = JSON.parse(userCookie);
			} catch (error) {
				console.error('Error parsing user cookie in layout:', error);
				// Clear invalid cookie
				cookies.delete('user', { path: '/' });
				user = null;
			}
		}
	}

	const token = locals.token || cookies.get('token');

	return {
		user,
		isAuthenticated: !!token,
		token: token || null
	};
}
