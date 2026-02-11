// src/routes/grup-pertemanan/+page.server.js
import { 
	getTableLokPlanoService,
	getZonaRakService,
	getLineRakService,
	submitNearestGroupService
} from '$lib/services/groupPertemanan.js';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url, getClientAddress }) {
	// Ambil data dari session/locals
	const officeId = locals.user?.officecode || '';
	const userNik = locals.user?.id || '';
	const userName = locals.user?.username || '';
	const userId = userNik ? `${userNik} - ${userName.toUpperCase()}` : '';
	const ipId = getClientAddress() || locals.clientIp || '';
	const pageId = url.pathname;

	return {
		officeId,
		userId,
		ipId,
		pageId
	};
}    

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Action untuk get table lokasi planogram
	 */
	getTableLokPlano: async ({ request }) => {
		const formData = await request.formData();
		const office = formData.get('office');
		const pluid = formData.get('pluid');

		const result = await getTableLokPlanoService(office, pluid);

		if (!result.success) {
			return fail(400, { 
				error: result.message,
				success: false
			});
		}

		return {
			success: true,
			data: result.data
		};
	},

	/**
	 * Action untuk get zona rak
	 */
	getZonaRak: async ({ request }) => {
		const formData = await request.formData();
		const tiperak = formData.get('tiperak');

		const result = await getZonaRakService(tiperak);

		if (!result.success) {
			return fail(400, { 
				error: result.message,
				success: false
			});
		}

		return {
			success: true,
			data: result.data
		};
	},

	/**
	 * Action untuk get line rak
	 */
	getLineRak: async ({ request }) => {
		const formData = await request.formData();
		const tiperak = formData.get('tiperak');
		const linerak = formData.get('linerak');

		const result = await getLineRakService(tiperak, linerak);

		if (!result.success) {
			return fail(400, { 
				error: result.message,
				success: false
			});
		}

		return {
			success: true,
			data: result.data
		};
	},

	/**
	 * Action untuk submit nearest group
	 */
	submit: async ({ request, locals, getClientAddress }) => {
		const formData = await request.formData();
		
		// Parse nearestGroups dari JSON string
		const nearestGroupsJson = formData.get('nearestGroups');
		// const nearestGroups = nearestGroupsJson ? JSON.parse(nearestGroupsJson) : [];
		const nearestGroups = JSON.parse(nearestGroupsJson);

		// Validation
        if (!nearestGroups || nearestGroups.length === 0) {
            return fail(400, { error: 'Belum ada data pertemanan yang dipilih' });
        }

		// Check duplicates
		const lines = nearestGroups.map(g => g.line);
		if ([...new Set(lines)].length < lines.length) {
			return fail(400, { error: 'Terdapat duplikasi data line' });
		}

		// Transform to PHP format
        const lineNearestGroup = {};
        const rakNearestGroup = {};

        nearestGroups.forEach((group, index) => {
            const key = (index + 1).toString();
            lineNearestGroup[key] = group.line;
            rakNearestGroup[key] = group.rak;
        });

		// Build payload
        const payload = {
            ipId: getClientAddress(),
            officeId: formData.get('officeId'),
            pluId: formData.get('pluId'),
            tipePlano: formData.get('tipePlano'),
            lineNearestGroup,
            rakNearestGroup
        };

		const result = await submitNearestGroupService(payload);

		if (!result.success) {
			return fail(400, { 
				error: result.message,
				success: false
			});
		}

		return {
			success: true,
			message: result.message,
			data: result.data
		};
	}
};